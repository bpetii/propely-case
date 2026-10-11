import cors from 'cors';
import express from 'express';
import { openDatabase } from './db.js';
import type { Property, TaskWithProperty } from './types.js';
import { validateTaskFilters } from './utils.js';

const PORT = Number(process.env.PORT ?? 8080);

const db = openDatabase();
const selectTasks = db.prepare<{
  status: string | null;
  category: string | null;
  property_id: string | null;
}, TaskWithProperty>(`
  SELECT tasks.*, properties.name AS property_name
  FROM tasks
  JOIN properties ON tasks.property_id = properties.id
  WHERE (@status IS NULL OR tasks.status = @status)
    AND (@category IS NULL OR tasks.category = @category)
    AND (@property_id IS NULL OR tasks.property_id = @property_id)
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
    res.status(500).json({ error: 'Could not fetch tasks.' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`);
});
