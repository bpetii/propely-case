import cors from 'cors';
import express from 'express';
import { openDatabase } from './db.js';
import type { Property, TaskWithProperty } from './types.js';
import { validateTaskFilters } from './utils.js';

const PORT = Number(process.env.PORT ?? 8080);

const db = openDatabase();
// SQLite's built-in lower() only handles ASCII; include Norwegian letters too.
// For example: 'Åkerveien', not 'åkerveien'. https://www.sqlitetutorial.net/sqlite-functions/sqlite-lower/
db.function('unicode_lower', { deterministic: true }, (value: string) => value.toLowerCase());
const selectTasks = db.prepare<{
  status: string | null;
  category: string | null;
  property_id: string | null;
  search: string | null;
}, TaskWithProperty>(`
  SELECT tasks.*, properties.name AS property_name
  FROM tasks
  JOIN properties ON tasks.property_id = properties.id
  WHERE (@status IS NULL OR tasks.status = @status)
    AND (@category IS NULL OR tasks.category = @category)
    AND (@property_id IS NULL OR tasks.property_id = @property_id)
    AND (@search IS NULL
      OR instr(unicode_lower(tasks.title), @search) > 0
      OR instr(unicode_lower(tasks.property_id), @search) > 0
      OR instr(unicode_lower(properties.name), @search) > 0)
  ORDER BY tasks.created_at DESC, tasks.id ASC
`);
const selectProperties = db.prepare<[], Property>('SELECT id, name FROM properties ORDER BY name, id');

const app = express();

app.use(cors());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/properties', (_req, res) => {
  res.json(selectProperties.all());
});

app.get('/api/tasks', (req, res) => {
  const result = validateTaskFilters(req.query);
  if (!result.valid) {
    res.status(400).json({ error: result.error });
    return;
  }
  try {
    res.json(selectTasks.all(result.filters));
  } catch {
    // An empty array means no matching tasks.
    // return 500 so database failures show as errors in the UI.
    res.status(500).json({ error: 'Could not fetch tasks.' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`);
});
