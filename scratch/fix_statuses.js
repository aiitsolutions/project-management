import fs from 'fs';
const path = 'database/items.json';
const items = JSON.parse(fs.readFileSync(path, 'utf8'));
const updatedItems = items.map(item => {
  if (item.sprintId && item.status === 'Backlog') {
    return { ...item, status: 'To Do' };
  }
  return item;
});
fs.writeFileSync(path, JSON.stringify(updatedItems, null, 2));
console.log('Fixed statuses for items in sprints');
