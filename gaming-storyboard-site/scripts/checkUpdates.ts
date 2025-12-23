import { execSync } from "child_process";

interface Recommendation {
  pkg: string;
  current: string;
  latest: string;
  type: "patch" | "minor" | "major" | "unknown";
}

// Simple semver diff classifier
function classifyUpdate(current: string, latest: string): "patch" | "minor" | "major" | "unknown" {
  const normalize = (v: string) => v.replace(/^[^\d]*/, ""); // strip ^ ~ etc.
  const cParts = normalize(current).split(".").map(Number);
  const lParts = normalize(latest).split(".").map(Number);

  if (cParts.length < 3 || lParts.length < 3) return "unknown";

  if (lParts[0] > cParts[0]) return "major";
  if (lParts[1] > cParts[1]) return "minor";
  if (lParts[2] > cParts[2]) return "patch";
  return "unknown";
}

function runCheckUpdates(): void {
  try {
    // Run npm-check-updates without updating package.json
    const output: string = execSync("npx npm-check-updates", { encoding: "utf-8" });

    console.log("Dependency Update Report:\n");
    console.log(output);

    // Extract recommended versions from output lines containing "→"
    const lines: string[] = output.split("\n").filter((line) => line.includes("→"));
    const recommendations: Recommendation[] = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      const pkg = parts[0];
      const current = parts[1];
      const latest = parts[parts.length - 1];
      const type = classifyUpdate(current, latest);
      return { pkg, current, latest, type };
    });

    if (recommendations.length > 0) {
      console.log("\n✅ Recommended Version Bumps:");
      recommendations.forEach((r) => {
        const flag =
          r.type === "major"
            ? "⚠️ MAJOR (manual review)"
            : r.type === "minor"
            ? "➕ Minor (safe)"
            : r.type === "patch"
            ? "🔧 Patch (safe)"
            : "❓ Unknown";
        console.log(`- ${r.pkg}: ${r.current} → ${r.latest}  ${flag}`);
      });
    } else {
      console.log("\n🎉 All dependencies are up to date!");
    }

    console.log(
      "\n💡 To apply safe updates automatically, run:\n" +
        "   npx npm-check-updates --target minor -u && npm install\n" +
        "\n⚠️ For major updates, review changelogs and test before applying."
    );
  } catch (err: any) {
    console.error("❌ Error running npm-check-updates:", err.message);
  }
}

runCheckUpdates();

