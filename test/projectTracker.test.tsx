import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectTracker } from '../widgets/ProjectTracker';

describe('ProjectTracker', () => {
  it('renders all four kanban lanes', () => {
    render(<ProjectTracker />);
    expect(screen.getByText('Backlog')).toBeTruthy();
    expect(screen.getByText('Todo')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('renders default tasks in the board', () => {
    render(<ProjectTracker />);
    expect(screen.getByText('Define requirements')).toBeTruthy();
    expect(screen.getByText('Design DB Schema')).toBeTruthy();
    expect(screen.getByText('Project Setup')).toBeTruthy();
  });

  it('shows add-task input when plus button is clicked', () => {
    render(<ProjectTracker />);
    const addButton = screen.getByTitle('Add task to Backlog');
    fireEvent.click(addButton);
    expect(screen.getByPlaceholderText('Task name...')).toBeTruthy();
  });

  it('can add a new task to a lane', () => {
    render(<ProjectTracker />);
    const addButton = screen.getByTitle('Add task to Todo');
    fireEvent.click(addButton);
    const input = screen.getByPlaceholderText('Task name...');
    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Test task')).toBeTruthy();
  });
});
