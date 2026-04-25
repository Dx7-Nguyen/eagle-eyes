import { Card, CardBody, CardHeader, Divider } from "@heroui/react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-[#C8DDD0] border-l-4 border-l-[#00563F]" shadow="none">
      <CardHeader className="px-5 py-3">
        <h3 className="text-[#003D2B] font-bold m-0">{title}</h3>
      </CardHeader>
      <Divider />
      <CardBody className="px-5 py-4 text-sm leading-relaxed text-[#1A2E23]">
        {children}
      </CardBody>
    </Card>
  );
}

function HelpTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="w-full border-collapse text-sm mt-2">
      <thead>
        <tr className="bg-[#003D2B]">
          {headers.map((h) => (
            <th key={h} className="px-3 py-2 text-left text-[#F5D130] font-semibold text-xs uppercase tracking-wide border border-[#004D39]">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-[#C8DDD0] hover:bg-[#E8F5EE]">
            {row.map((cell, j) => (
              <td key={j} className="px-3 py-2 border border-[#C8DDD0]">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Help() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[#003D2B] font-bold text-2xl m-0">How to Use Eagle Eyes</h2>

      <Section title="Logging a Round">
        <ol className="pl-5 space-y-1.5">
          <li>Click <strong>New Round</strong> in the nav bar.</li>
          <li>Enter the course name and date.</li>
          <li>For each hole, set the par and enter shots one at a time.</li>
          <li>
            Each shot needs four values:
            <ul className="pl-5 mt-1 space-y-0.5 list-disc">
              <li><strong>From</strong> — starting lie type</li>
              <li><strong>Dist</strong> — distance to the hole before the shot</li>
              <li><strong>To</strong> — where the ball ended up</li>
              <li><strong>Dist</strong> — distance remaining after the shot</li>
            </ul>
          </li>
          <li>Click <strong>holed</strong> on the shot that went in — this locks endLie to HOLE automatically.</li>
          <li>Use <strong>+ Add shot</strong> to append shots; the next shot pre-fills from the previous end lie and distance.</li>
          <li>Use <strong>+ Add hole</strong> to add more holes, then click <strong>Save round</strong>.</li>
        </ol>
      </Section>

      <Section title="Distance Units">
        <HelpTable
          headers={["Lie", "Unit", "Example"]}
          rows={[
            ["TEE, FAIRWAY, ROUGH, SAND, RECOVERY", "Yards", "380y tee shot"],
            ["GREEN", "Feet", "18ft putt"],
          ]}
        />
      </Section>

      <Section title="Lie Types">
        <HelpTable
          headers={["Lie", "When to use"]}
          rows={[
            ["TEE", "Tee box on par 4 or par 5 (Tee category)"],
            ["FAIRWAY", "Short grass in the fairway"],
            ["ROUGH", "Longer grass off the fairway"],
            ["SAND", "Bunker or sand trap"],
            ["RECOVERY", "Trees, hardpan, unplayable, punch-out"],
            ["GREEN", "On the putting surface (distance in feet)"],
          ]}
        />
      </Section>

      <Section title="Strokes Gained Categories">
        <p className="text-[#4A6B57] mb-3">
          Each shot is automatically assigned to a category and compared against a PGA Tour baseline.
          Positive = you outperformed the baseline; negative = you underperformed.
        </p>
        <HelpTable
          headers={["Category", "Includes"]}
          rows={[
            ["Tee", "Tee shots on par 4s and par 5s"],
            ["Approach", "Tee shots on par 3s + any shot >30y from non-green lies"],
            ["Short Game", "Shots within 30y from non-green lies (chips, pitches, bunkers)"],
            ["Putting", "Any shot starting on the green"],
          ]}
        />
      </Section>

      <Section title="Trends">
        <p className="text-[#4A6B57]">
          The <strong>Trends</strong> page charts your strokes gained by category over time.
          Use it to spot which part of your game is improving or needs work.
          The zero line represents scratch-level baseline performance.
        </p>
      </Section>
    </div>
  );
}
