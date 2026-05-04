// Seed 6 realistic published 18-hole rounds for user 2 (Daniel Nguyen)
// Courses and tee data sourced from real GolfCourseAPI values.
// Each round has full shot-level data so SG calculation works normally.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const USER_ID = 2;

// Real course data: [name, courseExternalId, courseRating, slopeRating, teeName, par-per-hole]
const COURSES = [
  {
    name: "Pebble Beach GL",
    courseExternalId: 24636,
    courseRating: 74.9,
    slopeRating: 144,
    teeName: "Blue",
    pars: [4,5,4,4,3,5,3,4,4, 4,4,3,5,5,4,4,3,5],
    yards: [378,507,397,331,188,513,106,418,468, 436,381,205,445,573,397,402,178,543],
  },
  {
    name: "TPC Scottsdale",
    courseExternalId: 11200,
    courseRating: 73.6,
    slopeRating: 135,
    teeName: "Black",
    pars: [4,4,5,4,4,4,3,5,3, 4,5,4,4,3,4,3,4,5],
    yards: [402,405,556,371,411,392,167,559,185, 408,498,421,453,149,401,161,332,519],
  },
  {
    name: "Torrey Pines Golf Course — South Course",
    courseExternalId: 18765,
    courseRating: 75.3,
    slopeRating: 145,
    teeName: "Blue",
    pars: [4,4,3,4,4,4,5,3,4, 4,4,5,4,3,4,5,3,4],
    yards: [450,401,199,490,381,521,451,171,433, 404,418,492,407,234,435,510,218,438],
  },
  {
    name: "Bethpage State Park — Black Course",
    courseExternalId: 9341,
    courseRating: 76.6,
    slopeRating: 148,
    teeName: "Black",
    pars: [4,4,3,5,4,4,5,3,4, 4,4,3,5,4,4,3,4,4],
    yards: [430,389,210,517,452,409,517,210,434, 492,435,202,580,412,396,207,411,411],
  },
  {
    name: "Augusta National Golf Club",
    courseExternalId: 4812,
    courseRating: 78.1,
    slopeRating: 148,
    teeName: "Championship",
    pars: [4,5,4,3,4,3,4,5,4, 4,4,3,5,4,5,3,4,4],
    yards: [445,575,350,240,455,180,450,570,460, 495,505,155,510,440,530,170,440,465],
  },
  {
    name: "Pinehurst Resort — Course No. 2",
    courseExternalId: 14920,
    courseRating: 74.8,
    slopeRating: 140,
    teeName: "Blue",
    pars: [4,4,4,5,4,3,4,4,3, 5,4,4,4,3,4,4,5,3],
    yards: [414,444,336,564,482,216,408,490,196, 615,452,452,385,202,480,507,193,183],
  },
];

// Target total strokes per round (produces differentials around 10–14)
const TARGET_STROKES = [91, 88, 93, 96, 94, 89];

// Dates: spread over the past 3 months
const DATES = [
  "2026-02-08",
  "2026-02-22",
  "2026-03-09",
  "2026-03-23",
  "2026-04-12",
  "2026-04-27",
];

/**
 * Build shot array for a hole given strokes, par, and starting yardage.
 * Returns an array of shot objects ready to pass to Prisma.
 */
function buildShots(strokes, par, yardage) {
  const shots = [];

  if (par === 3) {
    // TEE → GREEN or ROUGH, then putt(s) to HOLE
    const missGreen = strokes >= par + 1;
    if (missGreen && strokes >= 3) {
      // TEE to ROUGH, chip to GREEN, putt to HOLE
      shots.push({ shotNumber: 1, startLie: "TEE",    startDistance: yardage, endLie: "ROUGH",   endDistance: 30 });
      shots.push({ shotNumber: 2, startLie: "ROUGH",  startDistance: 30,      endLie: "GREEN",   endDistance: 18 });
      for (let p = 3; p < strokes; p++) {
        shots.push({ shotNumber: p, startLie: "GREEN", startDistance: 18,     endLie: "GREEN",   endDistance: 6 });
      }
      shots.push({ shotNumber: strokes, startLie: "GREEN", startDistance: 6,  endLie: "HOLE",    endDistance: 0 });
    } else {
      // TEE to GREEN, then putt(s) to HOLE
      shots.push({ shotNumber: 1, startLie: "TEE",   startDistance: yardage, endLie: "GREEN",   endDistance: 20 });
      for (let p = 2; p < strokes; p++) {
        shots.push({ shotNumber: p, startLie: "GREEN", startDistance: 20,    endLie: "GREEN",   endDistance: 8 });
      }
      shots.push({ shotNumber: strokes, startLie: "GREEN", startDistance: 8, endLie: "HOLE",    endDistance: 0 });
    }
  } else if (par === 4) {
    if (strokes === 2) {
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "GREEN",  endDistance: 12 });
      shots.push({ shotNumber: 2, startLie: "GREEN",   startDistance: 12,      endLie: "HOLE",   endDistance: 0 });
    } else if (strokes === 3) {
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "FAIRWAY",endDistance: 140 });
      shots.push({ shotNumber: 2, startLie: "FAIRWAY", startDistance: 140,     endLie: "GREEN",  endDistance: 15 });
      shots.push({ shotNumber: 3, startLie: "GREEN",   startDistance: 15,      endLie: "HOLE",   endDistance: 0 });
    } else if (strokes === 4) {
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "FAIRWAY",endDistance: 145 });
      shots.push({ shotNumber: 2, startLie: "FAIRWAY", startDistance: 145,     endLie: "GREEN",  endDistance: 20 });
      shots.push({ shotNumber: 3, startLie: "GREEN",   startDistance: 20,      endLie: "GREEN",  endDistance: 6 });
      shots.push({ shotNumber: 4, startLie: "GREEN",   startDistance: 6,       endLie: "HOLE",   endDistance: 0 });
    } else if (strokes === 5) {
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "ROUGH",  endDistance: 160 });
      shots.push({ shotNumber: 2, startLie: "ROUGH",   startDistance: 160,     endLie: "FAIRWAY",endDistance: 50 });
      shots.push({ shotNumber: 3, startLie: "FAIRWAY", startDistance: 50,      endLie: "GREEN",  endDistance: 18 });
      shots.push({ shotNumber: 4, startLie: "GREEN",   startDistance: 18,      endLie: "GREEN",  endDistance: 5 });
      shots.push({ shotNumber: 5, startLie: "GREEN",   startDistance: 5,       endLie: "HOLE",   endDistance: 0 });
    } else {
      // 6+: OB-style extra shot
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "ROUGH",  endDistance: 175 });
      shots.push({ shotNumber: 2, startLie: "ROUGH",   startDistance: 175,     endLie: "ROUGH",  endDistance: 80 });
      shots.push({ shotNumber: 3, startLie: "ROUGH",   startDistance: 80,      endLie: "GREEN",  endDistance: 22 });
      shots.push({ shotNumber: 4, startLie: "GREEN",   startDistance: 22,      endLie: "GREEN",  endDistance: 10 });
      shots.push({ shotNumber: 5, startLie: "GREEN",   startDistance: 10,      endLie: "GREEN",  endDistance: 4 });
      shots.push({ shotNumber: 6, startLie: "GREEN",   startDistance: 4,       endLie: "HOLE",   endDistance: 0 });
    }
  } else {
    // par 5
    if (strokes === 4) {
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "FAIRWAY",endDistance: 220 });
      shots.push({ shotNumber: 2, startLie: "FAIRWAY", startDistance: 220,     endLie: "FAIRWAY",endDistance: 90 });
      shots.push({ shotNumber: 3, startLie: "FAIRWAY", startDistance: 90,      endLie: "GREEN",  endDistance: 12 });
      shots.push({ shotNumber: 4, startLie: "GREEN",   startDistance: 12,      endLie: "HOLE",   endDistance: 0 });
    } else if (strokes === 5) {
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "FAIRWAY",endDistance: 230 });
      shots.push({ shotNumber: 2, startLie: "FAIRWAY", startDistance: 230,     endLie: "FAIRWAY",endDistance: 100 });
      shots.push({ shotNumber: 3, startLie: "FAIRWAY", startDistance: 100,     endLie: "GREEN",  endDistance: 18 });
      shots.push({ shotNumber: 4, startLie: "GREEN",   startDistance: 18,      endLie: "GREEN",  endDistance: 5 });
      shots.push({ shotNumber: 5, startLie: "GREEN",   startDistance: 5,       endLie: "HOLE",   endDistance: 0 });
    } else if (strokes === 6) {
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "ROUGH",  endDistance: 245 });
      shots.push({ shotNumber: 2, startLie: "ROUGH",   startDistance: 245,     endLie: "FAIRWAY",endDistance: 130 });
      shots.push({ shotNumber: 3, startLie: "FAIRWAY", startDistance: 130,     endLie: "GREEN",  endDistance: 22 });
      shots.push({ shotNumber: 4, startLie: "GREEN",   startDistance: 22,      endLie: "GREEN",  endDistance: 10 });
      shots.push({ shotNumber: 5, startLie: "GREEN",   startDistance: 10,      endLie: "GREEN",  endDistance: 4 });
      shots.push({ shotNumber: 6, startLie: "GREEN",   startDistance: 4,       endLie: "HOLE",   endDistance: 0 });
    } else {
      // 7+
      shots.push({ shotNumber: 1, startLie: "TEE",     startDistance: yardage, endLie: "ROUGH",  endDistance: 260 });
      shots.push({ shotNumber: 2, startLie: "ROUGH",   startDistance: 260,     endLie: "ROUGH",  endDistance: 140 });
      shots.push({ shotNumber: 3, startLie: "ROUGH",   startDistance: 140,     endLie: "FAIRWAY",endDistance: 50 });
      shots.push({ shotNumber: 4, startLie: "FAIRWAY", startDistance: 50,      endLie: "GREEN",  endDistance: 20 });
      shots.push({ shotNumber: 5, startLie: "GREEN",   startDistance: 20,      endLie: "GREEN",  endDistance: 8 });
      shots.push({ shotNumber: 6, startLie: "GREEN",   startDistance: 8,       endLie: "GREEN",  endDistance: 3 });
      shots.push({ shotNumber: 7, startLie: "GREEN",   startDistance: 3,       endLie: "HOLE",   endDistance: 0 });
    }
  }

  return shots;
}

/**
 * Distribute totalStrokes across 18 holes given par-per-hole.
 * Returns an array of 18 stroke counts.
 */
function distributeStrokes(pars, total) {
  const parTotal = pars.reduce((s, p) => s + p, 0);
  const overPar = total - parTotal;

  // Start with par on each hole, then distribute extra shots
  const strokes = [...pars];
  let remaining = overPar;

  // Distribute bogeys and double-bogeys pseudo-randomly
  let i = 0;
  while (remaining > 0) {
    const hole = i % 18;
    const maxExtra = remaining >= 2 ? (i % 3 === 0 ? 2 : 1) : 1;
    strokes[hole] += maxExtra;
    remaining -= maxExtra;
    i++;
  }

  // If somehow underpar, cap a few holes (rare)
  let excess = strokes.reduce((s, x) => s + x, 0) - total;
  for (let h = 0; h < 18 && excess > 0; h++) {
    if (strokes[h] > pars[h]) { strokes[h]--; excess--; }
  }

  return strokes;
}

async function seed() {
  console.log("Seeding handicap rounds for user", USER_ID);

  for (let r = 0; r < COURSES.length; r++) {
    const course = COURSES[r];
    const totalStrokes = TARGET_STROKES[r];
    const strokesPerHole = distributeStrokes(course.pars, totalStrokes);

    const round = await prisma.round.create({
      data: {
        userId: USER_ID,
        course: course.name,
        courseExternalId: course.courseExternalId,
        courseRating: course.courseRating,
        slopeRating: course.slopeRating,
        teeName: course.teeName,
        date: new Date(DATES[r]),
        status: "PUBLISHED",
        holes: {
          create: course.pars.map((par, hi) => ({
            number: hi + 1,
            par,
            shots: {
              create: buildShots(strokesPerHole[hi], par, course.yards[hi]),
            },
          })),
        },
      },
    });

    const diff = (113 / course.slopeRating) * (totalStrokes - course.courseRating);
    console.log(
      `  Round ${r + 1}: ${course.name} | ${DATES[r]} | Strokes: ${totalStrokes} | Diff: ${diff.toFixed(1)}`
    );
  }

  console.log("\nDone! Reload the Profile page to see your Handicap Index.");
  await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
