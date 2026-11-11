"""Catalog of commands JARVIS can authorize.

The backend NEVER touches the phone. Its job is to validate, risk-assess and
authorize a command, then return a *directive* that the native mobile app
executes with the user's OS permissions. This keeps a single security choke
point and a complete audit trail, while respecting that only the device can
perform device actions.

Risk levels:
    low     — no confirmation needed (e.g. battery status, flashlight)
    medium  — benign but visible side effects (open app, set alarm)
    high    — reaches people, money or data; ALWAYS needs explicit confirmation
              (place a call, send/draft a message to a contact, share content)
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Command:
    name: str
    description: str
    risk: str                       # low | medium | high
    requires_confirmation: bool
    permissions: list[str] = field(default_factory=list)  # OS permissions the device must hold
    params: list[str] = field(default_factory=list)       # expected parameter keys


# Device permissions are declared by the client as currently-granted; the
# dispatcher refuses a command whose permissions are not all granted.
COMMANDS: dict[str, Command] = {
    "battery_status": Command(
        "battery_status", "Report battery level and charging state.",
        risk="low", requires_confirmation=False),
    "flashlight": Command(
        "flashlight", "Turn the flashlight/torch on or off.",
        risk="low", requires_confirmation=False, permissions=["camera.torch"], params=["on"]),
    "launch_camera": Command(
        "launch_camera", "Open the camera app.",
        risk="low", requires_confirmation=False, permissions=["camera"]),
    "open_app": Command(
        "open_app", "Open an installed application by name or package/scheme.",
        risk="medium", requires_confirmation=False, params=["app"]),
    "open_navigation": Command(
        "open_navigation", "Open maps/navigation to a destination.",
        risk="medium", requires_confirmation=False, params=["destination"]),
    "set_alarm": Command(
        "set_alarm", "Set an alarm at a given time.",
        risk="medium", requires_confirmation=False, permissions=["alarms"], params=["time", "label"]),
    "set_reminder": Command(
        "set_reminder", "Create a reminder.",
        risk="medium", requires_confirmation=False, permissions=["reminders"], params=["title", "due"]),
    "read_notifications": Command(
        "read_notifications", "Read out recent notifications.",
        risk="high", requires_confirmation=True, permissions=["notifications.read"]),
    "read_contacts": Command(
        "read_contacts", "Look up a contact.",
        risk="high", requires_confirmation=True, permissions=["contacts.read"], params=["query"]),
    "place_call": Command(
        "place_call", "Start a phone call to a number or contact.",
        risk="high", requires_confirmation=True, permissions=["phone.call"], params=["recipient"]),
    "draft_message": Command(
        "draft_message", "Open a pre-filled message to a recipient (user taps Send).",
        risk="high", requires_confirmation=True, permissions=["messages.compose"],
        params=["recipient", "body"]),
    "share_content": Command(
        "share_content", "Open the system share sheet with content.",
        risk="medium", requires_confirmation=False, params=["content"]),
    "device_setting": Command(
        "device_setting", "Open a supported device settings page (wifi, bluetooth, display…).",
        risk="medium", requires_confirmation=False, params=["setting"]),
}


def get(name: str) -> Command | None:
    return COMMANDS.get(name)
