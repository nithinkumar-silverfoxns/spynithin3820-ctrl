"""Expose the command registry to the model as OpenAI function-calling tools.

The model may *request* a tool call; the backend still runs every request
through the secure dispatcher (permissions, risk, confirmation) before anything
reaches the device. The model never executes anything directly.
"""
from __future__ import annotations

from app.commands import registry

SYSTEM_INSTRUCTIONS = (
    "You are JARVIS by Silverfoxns, a concise, warm, professional voice assistant. "
    "Your wake phrase is 'Hey Silverfox'. Keep spoken replies short and natural. "
    "To act on the phone, call a tool rather than describing the action. "
    "High-risk actions (calls, messages, reading contacts or notifications) will be "
    "confirmed with the user by the system before they run — do not pretend they are done. "
    "If something isn't supported by a tool, say so and suggest a Shortcut or setting."
)


def tool_specs() -> list[dict]:
    specs: list[dict] = []
    for cmd in registry.COMMANDS.values():
        properties = {k: {"type": "string", "description": f"{k} for {cmd.name}"} for k in cmd.params}
        if cmd.name == "flashlight":
            properties["on"] = {"type": "boolean", "description": "true to turn on, false for off"}
        specs.append({
            "type": "function",
            "function": {
                "name": cmd.name,
                "description": cmd.description,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": [p for p in cmd.params if p != "label"],
                },
            },
        })
    return specs
