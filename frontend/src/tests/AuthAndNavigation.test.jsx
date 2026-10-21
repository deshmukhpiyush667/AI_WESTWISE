import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WasteGuidePage from '../pages/WasteGuidePage';
import RecyclingLocatorPage from '../pages/RecyclingLocatorPage';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

describe('WasteGuidePage Component', () => {
  it('renders all 6 waste categories', () => {
    render(<WasteGuidePage />);
    expect(screen.getByText('Comprehensive Waste Disposal Guide')).toBeInTheDocument();
    expect(screen.getAllByText('Organic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plastic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Paper').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Metal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Glass').length).toBeGreaterThan(0);
    expect(screen.getAllByText('E-Waste').length).toBeGreaterThan(0);
  });
});

describe('RecyclingLocatorPage Component', () => {
  it('renders header, location button, and material filter options', () => {
    render(<RecyclingLocatorPage />);
    expect(screen.getByText('Recycling & E-Waste Center Locator')).toBeInTheDocument();
    expect(screen.getByText('Find Centers Near Me')).toBeInTheDocument();
    expect(screen.getByText('Filter Accepted Materials:')).toBeInTheDocument();
  });
});

describe('App Root Component', () => {
  it('renders Navbar with brand and active Home landing page', () => {
    render(<App />);
    expect(screen.getAllByText(/AI Waste/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Intelligent Waste Sorting at the Speed of Light/i)).toBeInTheDocument();
  });
});

