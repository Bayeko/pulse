import { render, screen } from '@testing-library/react';
import React from 'react';
import Hello from './Hello';

test('renders greeting', () => {
  render(<Hello />);
  expect(screen.getByText('Hello world')).toBeInTheDocument();
});
