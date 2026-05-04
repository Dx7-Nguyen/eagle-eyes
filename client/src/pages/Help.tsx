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

      <Section title="Creating an Account">
        <ol className="pl-5 space-y-1.5">
          <li>
            Go to the <strong>Get Started</strong> page (linked from the landing page or navigate to <code className="bg-[#E8F5EE] px-1 rounded">/register</code>).
          </li>
          <li>Enter your full name and email address.</li>
          <li>
            Create a password that meets these requirements:
            <ul className="pl-5 mt-1 space-y-0.5 list-disc">
              <li>8 to 128 characters long</li>
              <li>Letters (A–Z, a–z) and numbers (0–9) only — no special characters</li>
            </ul>
          </li>
          <li>Click <strong>Create Account</strong>. You'll be signed in automatically.</li>
        </ol>
        <p className="text-[#4A6B57] mt-3">
          Your rounds and stats are private — only you can see them after signing in.
        </p>
      </Section>

      <Section title="Signing In & Out">
        <ol className="pl-5 space-y-1.5">
          <li>Navigate to <code className="bg-[#E8F5EE] px-1 rounded">/login</code> or click <strong>Sign In</strong> on the landing page.</li>
          <li>Enter the email and password you registered with.</li>
          <li>Your session lasts 7 days — you won't need to sign in again on the same device.</li>
          <li>To sign out, click <strong>Sign Out</strong> in the top-right corner of the nav bar.</li>
        </ol>
      </Section>

      <Section title="Your Profile">
        <p className="text-[#4A6B57] mb-3">
          Visit the <strong>Profile</strong> page from the nav bar to view your stats and manage your account details.
        </p>
        <ul className="pl-5 space-y-1.5 list-disc">
          <li>
            <strong>Full Name</strong> — click <strong>Edit name</strong> to update your name, then <strong>Save</strong> to confirm. Press <code className="bg-[#E8F5EE] px-1 rounded">Esc</code> or <strong>Cancel</strong> to discard changes.
          </li>
          <li>
            <strong>Gender</strong> — select Male, Female, or Not set from the dropdown. The change saves automatically. Gender is also used to choose the correct tee set (men's or women's) when displaying course info on the New Round page.
          </li>
          <li>
            <strong>Handicap Index</strong> — displayed as a stat card at the top of the Profile page. Calculated automatically from your published 18-hole rounds at API-matched courses. Shows "Pending — N more rounds needed" until at least 3 eligible rounds are logged.
          </li>
        </ul>
      </Section>

      <Section title="Logging a Round">
        <ol className="pl-5 space-y-1.5">
          <li>Click <strong>New Round</strong> in the nav bar.</li>
          <li>
            Start typing the course name — Eagle Eyes searches a global course database and shows matches.
            Pick one to lock in the official name, or just type your own if your course isn't listed.
            When a course is matched, a course info strip appears showing <strong>Par, Yards, Course Rating, Slope,</strong> and <strong>Holes</strong> for the selected tee.
            If multiple tees are available, a <strong>Tee</strong> dropdown lets you switch (e.g. Blue, White, Red).
          </li>
          <li>Pick the date.</li>
          <li>
            Choose your <strong>round type</strong> — <strong>Front 9</strong>, <strong>Back 9</strong>, or <strong>18 Holes</strong>.
            This sets the hole numbering (Back 9 starts at hole 10) and limits how many holes you can add.
          </li>
          <li>
            If a course was matched, all holes are <strong>pre-populated</strong> with the correct par and tee yardage as the starting distance.
            Adjust any hole individually if needed.
          </li>
          <li>For each hole, enter shots one at a time.</li>
          <li>
            Each shot needs four values:
            <ul className="pl-5 mt-1 space-y-0.5 list-disc">
              <li><strong>From</strong> — starting lie type</li>
              <li><strong>Dist</strong> — distance to the hole before the shot</li>
              <li><strong>To</strong> — where the ball ended up</li>
              <li><strong>Dist</strong> — distance remaining after the shot</li>
            </ul>
          </li>
          <li>
            Click <strong>holed</strong> on the shot that went in — this locks the end lie to HOLE.
            The hole card shows a <strong>Complete</strong> badge once all shots are accounted for.
          </li>
          <li>Use <strong>+ Add shot</strong> to append shots; each new shot pre-fills from the previous end lie and distance.</li>
          <li>Use <strong>+ Add hole</strong> to add more holes (up to the round type limit).</li>
          <li>
            When every hole is complete, click <strong>Finish round</strong> in the top-right of the page.
            A confirmation prompt will appear — review the details and click <strong>Publish round</strong> to save it to your history.
          </li>
        </ol>
        <p className="text-[#4A6B57] mt-3">
          <strong>Tip:</strong> distance fields are pre-filled from the selected tee when a course is matched. You can edit any value — click the field, backspace to clear it, and type your actual distance. Leaving it blank defaults back to 0.
        </p>
      </Section>

      <Section title="Saving Progress & Resuming a Round">
        <p className="text-[#4A6B57] mb-3">
          You don't have to finish a round in one sitting. Eagle Eyes lets you save your progress at any point and pick up where you left off.
        </p>
        <ol className="pl-5 space-y-1.5">
          <li>
            Click <strong>Save progress</strong> at any time — even with only one hole logged.
            The round is saved as a draft and the URL updates to include a draft ID (e.g. <code className="bg-[#E8F5EE] px-1 rounded">/new?draft=3</code>).
          </li>
          <li>
            To return to the round later, go to <strong>Rounds</strong> in the nav bar.
            Any in-progress drafts appear in an <strong>In Progress</strong> section at the top, showing the course name, date, and number of holes logged so far.
          </li>
          <li>Click <strong>Continue →</strong> next to a draft to reopen the round form with all your holes and shots restored.</li>
          <li>Keep adding holes and saving progress as you play. Each click of <strong>Save progress</strong> overwrites the previous draft.</li>
          <li>Once every hole is marked complete, click <strong>Finish round</strong> and confirm to publish.</li>
        </ol>
        <p className="text-[#4A6B57] mt-3">
          Drafts are not included in your Trends or round history until you publish them.
        </p>
      </Section>

      <Section title="Deleting Rounds & Drafts">
        <p className="text-[#4A6B57] mb-3">
          You can delete any round or in-progress draft from the <strong>Rounds</strong> page.
        </p>
        <ul className="pl-5 space-y-1.5 list-disc">
          <li>
            <strong>In-progress drafts</strong> — click <strong>Delete</strong> next to the draft in the <strong>In Progress</strong> section. A confirmation prompt will appear before anything is removed.
          </li>
          <li>
            <strong>Published rounds</strong> — click <strong>Delete</strong> in the row of the round you want to remove from the table, or use the <strong>Delete Round</strong> button on the round's detail page.
          </li>
        </ul>
        <p className="text-[#4A6B57] mt-3">
          Deletion is permanent and cannot be undone. Deleting a draft discards all logged holes and shots for that round.
        </p>
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

      <Section title="Handicap Index">
        <p className="text-[#4A6B57] mb-3">
          Your <strong>Handicap Index</strong> appears on the Profile page and is calculated using the
          official World Handicap System (WHS) formula from your published rounds.
        </p>
        <p className="text-[#4A6B57] mb-3">
          For each eligible round, Eagle Eyes computes a <strong>score differential</strong>:
        </p>
        <div className="bg-[#E8F5EE] border border-[#C8DDD0] rounded-lg px-4 py-2 font-mono text-xs text-[#003D2B] mb-3">
          Differential = (113 / Slope Rating) × (Adjusted Gross Score − Course Rating)
        </div>
        <p className="text-[#4A6B57] mb-3">
          Adjusted Gross Score caps any hole at <strong>par + 5</strong> (the WHS Maximum Hole Score
          for unestablished handicaps). Your index is then the average of the lowest differentials
          from your most recent 20 eligible rounds, following the WHS lookup table (e.g. 3 rounds →
          lowest 1 minus 2.0; 20 rounds → average of lowest 8).
        </p>
        <p className="text-[#4A6B57]">
          <strong>Eligibility:</strong> only <strong>18-hole rounds</strong> at a course matched
          from the Eagle Eyes course database (so we have official Course Rating and Slope) count.
          9-hole rounds and free-text courses still log normally but don't affect the index.
          You need at least <strong>3 eligible rounds</strong> to establish a handicap.
        </p>
      </Section>

      <Section title="Trends">
        <p className="text-[#4A6B57]">
          The <strong>Trends</strong> page charts your strokes gained by category over time.
          Use it to spot which part of your game is improving or needs work.
          The zero line represents scratch-level baseline performance. Only published rounds appear in Trends.
        </p>
      </Section>
    </div>
  );
}
