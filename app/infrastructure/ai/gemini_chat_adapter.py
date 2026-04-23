from google import genai
from google.genai import types

from app.application.ports import IChatAdapter
from app.domain.conversation.entities import Message


class GeminiChatAdapter(IChatAdapter):
    def __init__(self, client: genai.Client, model: str):
        self._client = client
        self._model = model

    async def send_message(
        self,
        history: list[Message],
        system_prompt: str,
    ) -> str:
        # All messages except the last one form history; the last is the current user message
        prior_messages = history[:-1]
        current_message = history[-1].content.text

        gemini_history = [
            types.Content(
                role=msg.role.value,
                parts=[types.Part(text=msg.content.text)],
            )
            for msg in prior_messages
        ]

        chat = self._client.aio.chats.create(
            model=self._model,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            ),
            history=gemini_history,
        )
        response = await chat.send_message(current_message)
        return response.text
