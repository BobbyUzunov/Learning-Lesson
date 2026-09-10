import { describe, expect, it } from "vitest";
import { csvCell } from "./csv";

describe("spreadsheet CSV cells", () => {
  it.each([
    "=1+1", "+1+1", "-1+1", "@SUM(A1)", "  =1+1", "\t=1+1",
    "\r=1+1", "\n=1+1", "\uFEFF=1+1", "＝1+1", "＋1+1", "－1+1", "＠SUM(A1)"
  ])("keeps formula-like input %j as quoted text", (value) => {
    expect(csvCell(value)).toBe(`"\t${value}"`);
  });

  it("escapes separators and quotes inside protected cells", () => {
    expect(csvCell('=HYPERLINK("https://example.com","Open")')).toBe(
      '"\t=HYPERLINK(""https://example.com"",""Open"")"'
    );
    expect(csvCell('Ada, "=1+1"\nnext line')).toBe('"Ada, ""=1+1""\nnext line"');
  });

  it.each(["Ада Ловлейс", "400", "0", "80%", "", "Урок — част 1"])(
    "preserves ordinary text and numbers %j", (value) => {
      expect(csvCell(value)).toBe(value);
    }
  );
});
