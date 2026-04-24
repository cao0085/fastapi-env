from app.application.ports import IChatAdapter
from app.domain.conversation.entities import ConversationSession
from app.domain.conversation.repository import IConversationRepository
from app.domain.conversation.value_objects import MessageRole, SessionId
from app.shared.prompts import JAZZ_CHAT_SYSTEM

from .dtos import ConversationDTO, SendMessageCommand


class ChatService:
    def __init__(
        self,
        conversation_repo: IConversationRepository,
        ai_adapter: IChatAdapter,
    ):
        self._repo = conversation_repo
        self._ai = ai_adapter

    async def send_message(self, cmd: SendMessageCommand) -> ConversationDTO:
        session_id = SessionId(cmd.session_id)

        session = await self._repo.get(session_id)
        if session is None:
            session = ConversationSession.new(session_id)

        session.add_message(MessageRole.USER, cmd.message)

        history = session.get_history_for_ai()

        reply_text = await self._ai.send_message(
            history=history,
            system_prompt=JAZZ_CHAT_SYSTEM,
        )

        session.add_message(MessageRole.MODEL, reply_text)

        await self._repo.save(session)

        return ConversationDTO(
            session_id=cmd.session_id,
            reply=reply_text,
            turn_count=len(session.messages),
        )
