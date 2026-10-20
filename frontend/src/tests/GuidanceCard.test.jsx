import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GuidanceCard from '../components/classify/GuidanceCard';

describe('GuidanceCard Component', () => {
  it('renders target bin and recyclable badges', () => {
    const mockGuidance = {
      label: 'Organic / Biodegradable',
      bin_color: 'Green',
      bin_hex: '#16845B',
      recyclable: true,
      is_hazardous: false,
      description: 'Food scraps and peels',
      disposal_instructions: [
        'Deposit in the green composting bin.',
        'Keep separate from plastic packaging.'
      ],
      environmental_impact: 'Reduces landfill methane emissions.',
    };

    render(<GuidanceCard guidance={mockGuidance} />);

    expect(screen.getByText('Organic / Biodegradable')).toBeInTheDocument();
    expect(screen.getByText('Green Bin')).toBeInTheDocument();
    expect(screen.getByText('Recyclable')).toBeInTheDocument();
    expect(screen.getByText('Deposit in the green composting bin.')).toBeInTheDocument();
    expect(screen.getByText(/Reduces landfill methane emissions/i)).toBeInTheDocument();
  });
});
