import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state = "result",
  result: unknown = "Success"
) {
  return { toolName, args, state, result };
}

// --- str_replace_editor ---

test("str_replace_editor create → 'Creating {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/components/Card.jsx",
      })}
    />
  );
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("str_replace_editor str_replace → 'Editing {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "str_replace",
        path: "src/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor insert → 'Editing {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "insert",
        path: "src/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor undo_edit → 'Undoing edit on {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "undo_edit",
        path: "src/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Undoing edit on App.jsx")).toBeDefined();
});

test("str_replace_editor view → 'Reading {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "view",
        path: "src/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Reading App.jsx")).toBeDefined();
});

// --- file_manager ---

test("file_manager rename → 'Renaming {old} → {new}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "src/OldName.jsx",
        new_path: "src/NewName.jsx",
      })}
    />
  );
  expect(screen.getByText("Renaming OldName.jsx → NewName.jsx")).toBeDefined();
});

test("file_manager delete → 'Deleting {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "delete",
        path: "src/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Deleting App.jsx")).toBeDefined();
});

// --- fallback ---

test("unknown tool with unknown command falls back to raw toolName", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("some_unknown_tool", { command: "foo" })}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

// --- visual states ---

test("in-progress state: no green dot rendered", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "Card.jsx" },
        "call", // not "result"
        undefined
      )}
    />
  );
  // Green dot is a div with bg-emerald-500; should not be present
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeNull();
});

test("done state: green dot rendered, spinner absent", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "Card.jsx" },
        "result",
        "Success"
      )}
    />
  );
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();

  // Spinner has animate-spin class
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeNull();
});
