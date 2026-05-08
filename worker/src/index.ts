import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
	ADMIN_KEY: string;
	R2_PUBLIC_URL: string; // e.g. https://pub-xxxx.r2.dev
	MUSIC_SCORES_BUCKET: R2Bucket;
	DB: D1Database;
};

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

export default app;
