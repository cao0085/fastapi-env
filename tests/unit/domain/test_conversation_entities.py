from app.domain.conversation.entities import ConversationSession
from app.domain.conversation.value_objects import MessageRole, SessionId


def _make_session() -> ConversationSession:
    return ConversationSession.new(SessionId("test-session"))


class TestAddMessage:
    def test_adds_user_message(self):
        session = _make_session()
        msg = session.add_message(MessageRole.USER, "Hello")
        assert msg.role == MessageRole.USER
        assert msg.content.text == "Hello"
        assert len(session.messages) == 1

    def test_updates_last_active_at(self):
        session = _make_session()
        before = session.last_active_at
        session.add_message(MessageRole.USER, "Hello")
        assert session.last_active_at >= before


class TestGetHistoryForAi:
    def test_returns_all_messages_within_limit(self):
        session = _make_session()
        for i in range(10):
            session.add_message(MessageRole.USER, f"msg {i}")
        history = session.get_history_for_ai()
        assert len(history) == 10

    def test_trims_to_max_history_turns(self):
        session = _make_session()
        total = ConversationSession.MAX_HISTORY_TURNS + 5
        for i in range(total):
            session.add_message(MessageRole.USER, f"msg {i}")
        history = session.get_history_for_ai()
        assert len(history) == ConversationSession.MAX_HISTORY_TURNS

    def test_returns_latest_messages_when_trimmed(self):
        session = _make_session()
        total = ConversationSession.MAX_HISTORY_TURNS + 3
        for i in range(total):
            session.add_message(MessageRole.USER, f"msg {i}")
        history = session.get_history_for_ai()
        assert history[0].content.text == f"msg {3}"
        assert history[-1].content.text == f"msg {total - 1}"
