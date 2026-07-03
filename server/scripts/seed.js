/**
 * Seed Script — 20 random tasks
 * Run: node scripts/seed.js
 * Requires the backend server to be running on port 5000.
 */

const API = 'http://localhost:5000/api/v1/tasks';

const titles = [
  'Redesign the landing page hero section',
  'Fix authentication token expiry bug',
  'Write unit tests for payment module',
  'Set up CI/CD pipeline on GitHub Actions',
  'Conduct quarterly performance reviews',
  'Research competitor pricing strategies',
  'Migrate legacy codebase to TypeScript',
  'Schedule dentist appointment',
  'Complete online DSA course — Week 3',
  'Optimise PostgreSQL slow queries',
  'Create onboarding email sequence',
  'Read "Atomic Habits" — Chapter 8-12',
  'Prepare Q3 budget forecast spreadsheet',
  'Refactor API error handling layer',
  'Go for a 5km morning run',
  'Update project README and docs',
  'Buy groceries — vegetables & dairy',
  'Implement dark mode for mobile app',
  'Call insurance provider about claim',
  'Deploy hotfix to production server',
];

const descriptions = [
  'High priority — needs to be done before the sprint ends.',
  'Blocked on design feedback. Follow up with the team.',
  'Should cover edge cases and failure scenarios.',
  null,
  'Co-ordinate with HR for scheduling.',
  'Compile findings into a slide deck for stakeholders.',
  'Start with the utility modules first.',
  'Book for next Tuesday morning.',
  'Complete all practice problems at the end of the chapter.',
  'Focus on indexes and query planner output.',
  null,
  'Take notes in Notion as you read.',
  'Use data from Stripe and QuickBooks.',
  'Centralise all error responses using ApiError class.',
  null,
  'Include setup instructions and environment variables.',
  'Milk, eggs, spinach, tomatoes, yogurt.',
  'Follow the system preference via prefers-color-scheme.',
  'Reference number: CLM-2024-8821.',
  'Monitor error logs for 30 minutes post-deploy.',
];

const statuses  = ['todo', 'todo', 'todo', 'in-progress', 'in-progress', 'done'];
const priorities = ['low', 'medium', 'medium', 'high', 'urgent'];
const categories = ['work', 'work', 'personal', 'health', 'education', 'finance'];
const tagPool    = ['backend', 'frontend', 'devops', 'design', 'testing', 'urgent', 'blocked', 'review', 'quick-win', 'tech-debt'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
function futureDays(min, max) {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * (max - min) + min));
  return d.toISOString();
}
function pastDays(min, max) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * (max - min) + min));
  return d.toISOString();
}

async function seed() {
  console.log('🌱 Seeding 20 tasks...\n');
  let success = 0;

  for (let i = 0; i < 20; i++) {
    const status   = pick(statuses);
    const dueChoice = Math.random();

    const task = {
      title:       titles[i],
      description: descriptions[i] ?? undefined,
      status,
      priority:    pick(priorities),
      category:    pick(categories),
      tags:        pickN(tagPool, Math.floor(Math.random() * 3)),
      dueDate:     dueChoice < 0.15
        ? pastDays(1, 10)        // ~15% overdue
        : dueChoice < 0.3
          ? new Date().toISOString()  // ~15% due today
          : dueChoice < 0.7
            ? futureDays(1, 21)  // ~40% future
            : undefined,         // ~30% no due date
    };

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(`  ✗ [${i + 1}] ${task.title}\n    → ${JSON.stringify(err.errors || err.message)}`);
      } else {
        const data = await res.json();
        console.log(`  ✓ [${i + 1}] ${task.title} — ${status} / ${task.priority}`);
        success++;
      }
    } catch (e) {
      console.error(`  ✗ [${i + 1}] Network error: ${e.message}`);
    }
  }

  console.log(`\n✅ Done — ${success}/20 tasks seeded.`);
}

seed();
