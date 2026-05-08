import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
	ADMIN_KEY: string;
	R2_PUBLIC_URL: string; // e.g. https://pub-xxxx.r2.dev
	MUSIC_SCORES_BUCKET: R2Bucket;
	DB: D1Database;
	GOOGLE_CLIENT_ID: string;
};

interface GooglePayload {
	sub: string;
	email: string;
	name: string;
	picture: string;
}

async function verifyGoogleToken(token: string, clientId: string): Promise<GooglePayload> {
	const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
	const data = await res.json() as any;
	if (data.error || data.aud !== clientId) throw new Error("Invalid token");
	return { sub: data.sub, email: data.email, name: data.name, picture: data.picture };
}

async function requireUser(c: any): Promise<GooglePayload | Response> {
	const token = c.req.header("Authorization")?.replace("Bearer ", "");
	if (!token) return c.json({ error: "Unauthorized" }, 401);
	try {
		return await verifyGoogleToken(token, c.env.GOOGLE_CLIENT_ID);
	} catch {
		return c.json({ error: "Invalid token" }, 401);
	}
}

async function upsertUser(db: D1Database, user: GooglePayload): Promise<void> {
	await db.prepare(`
		INSERT INTO users (id, email, name, picture, updated_at)
		VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			email   = excluded.email,
			name    = excluded.name,
			picture = excluded.picture,
			updated_at = CURRENT_TIMESTAMP
	`).bind(user.sub, user.email, user.name, user.picture).run();
}

const app = new Hono<{ Bindings: Env }>();

app.use(
	"*",
	cors({
		origin: ["http://localhost:5173"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "X-Admin-Key"],
	})
);

function requireAdmin(c: any): Response | null {
	if (c.req.header("X-Admin-Key") !== c.env.ADMIN_KEY) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	return null;
}

// Admin: upload XML to R2
app.post("/admin/jazz-standard-xml/upload", async (c) => {
	const denied = requireAdmin(c);
	if (denied) return denied;

	const formData = await c.req.formData();
	const file = formData.get("file") as File | null;

	if (!file) return c.json({ error: "No file provided" }, 400);
	if (!file.name.endsWith(".xml")) return c.json({ error: "File must be .xml" }, 400);

	const key = `jazz-standard-xml/${file.name}`;
	const buffer = await file.arrayBuffer();

	await c.env.MUSIC_SCORES_BUCKET.put(key, buffer, {
		httpMetadata: { contentType: "application/xml" },
	});

	const xmlUrl = `${c.env.R2_PUBLIC_URL}/${key}`;

	return c.json({ xml_url: xmlUrl });
});

// Admin: overwrite scores.json in R2
app.post("/admin/scores-json/update", async (c) => {
	const denied = requireAdmin(c);
	if (denied) return denied;

	const body = await c.req.json();
	if (!Array.isArray(body)) return c.json({ error: "Body must be a JSON array" }, 400);

	const content = JSON.stringify(body, null, 2);
	await c.env.MUSIC_SCORES_BUCKET.put("scores.json", content, {
		httpMetadata: { contentType: "application/json" },
	});

	return c.json({ ok: true });
});

// POST /me — 登入後同步 user 資料
app.post("/me", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;
	await upsertUser(c.env.DB, user);
	return c.json({ ok: true });
});

// --- score_notes ---

// GET /notes/:scoreId — 取得該曲所有筆記
app.get("/notes/:scoreId", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;
	await upsertUser(c.env.DB, user);

	const { results } = await c.env.DB.prepare(
		"SELECT id, bar_start, bar_end, title, body, created_at, updated_at FROM score_notes WHERE user_id = ?1 AND score_id = ?2 ORDER BY bar_start ASC, created_at ASC"
	).bind(user.sub, c.req.param("scoreId")).all();

	return c.json(results);
});

// POST /notes/:scoreId — 新增筆記
app.post("/notes/:scoreId", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;
	await upsertUser(c.env.DB, user);

	const { bar_start, bar_end, title, body } = await c.req.json<{
		bar_start?: number; bar_end?: number; title?: string; body: string;
	}>();

	const result = await c.env.DB.prepare(
		"INSERT INTO score_notes (user_id, score_id, bar_start, bar_end, title, body) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
	).bind(user.sub, c.req.param("scoreId"), bar_start ?? null, bar_end ?? null, title ?? null, body).run();

	return c.json({ id: result.meta.last_row_id }, 201);
});

// PUT /notes/:scoreId/:id — 編輯筆記
app.put("/notes/:scoreId/:id", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;

	const { bar_start, bar_end, title, body } = await c.req.json<{
		bar_start?: number; bar_end?: number; title?: string; body: string;
	}>();

	await c.env.DB.prepare(
		"UPDATE score_notes SET bar_start=?1, bar_end=?2, title=?3, body=?4, updated_at=CURRENT_TIMESTAMP WHERE id=?5 AND user_id=?6"
	).bind(bar_start ?? null, bar_end ?? null, title ?? null, body, c.req.param("id"), user.sub).run();

	return c.json({ ok: true });
});

// DELETE /notes/:scoreId/:id — 刪除筆記
app.delete("/notes/:scoreId/:id", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;

	await c.env.DB.prepare(
		"DELETE FROM score_notes WHERE id=?1 AND user_id=?2"
	).bind(c.req.param("id"), user.sub).run();

	return c.json({ ok: true });
});

// --- score_related ---

// GET /related/:scoreId — 取得該曲所有關聯連結
app.get("/related/:scoreId", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;
	await upsertUser(c.env.DB, user);

	const { results } = await c.env.DB.prepare(
		"SELECT id, title, link, created_at FROM score_related WHERE user_id = ?1 AND score_id = ?2 ORDER BY created_at ASC"
	).bind(user.sub, c.req.param("scoreId")).all();

	return c.json(results);
});

// POST /related/:scoreId — 新增關聯連結
app.post("/related/:scoreId", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;
	await upsertUser(c.env.DB, user);

	const { title, link } = await c.req.json<{ title: string; link: string }>();

	const result = await c.env.DB.prepare(
		"INSERT INTO score_related (user_id, score_id, title, link) VALUES (?1, ?2, ?3, ?4)"
	).bind(user.sub, c.req.param("scoreId"), title, link).run();

	return c.json({ id: result.meta.last_row_id }, 201);
});

// DELETE /related/:scoreId/:id — 刪除關聯連結
app.delete("/related/:scoreId/:id", async (c) => {
	const user = await requireUser(c);
	if (user instanceof Response) return user;

	await c.env.DB.prepare(
		"DELETE FROM score_related WHERE id=?1 AND user_id=?2"
	).bind(c.req.param("id"), user.sub).run();

	return c.json({ ok: true });
});

export default app;
