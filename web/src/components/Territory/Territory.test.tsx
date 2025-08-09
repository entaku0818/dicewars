import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import Territory from './Territory';
import type { Territory as TerritoryType, Player } from '../../game/types';

describe('Territory', () => {
  const mockTerritory: TerritoryType = {
    id: 'test-1',
    ownerId: 'player-1',
    diceCount: 3,
    position: { x: 100, y: 100 },
    adjacentTerritoryIds: ['test-2', 'test-3'],
  };

  const mockPlayer: Player = {
    id: 'player-1',
    name: 'Test Player',
    color: '#FF0000',
    isAI: false,
    isActive: true,
  };

  const defaultProps = {
    territory: mockTerritory,
    owner: mockPlayer,
    isSelected: false,
    isClickable: true,
    onClick: vi.fn(),
  };

  it('should render territory with correct position', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} />
      </svg>
    );
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('cx')).toBe('100');
    expect(circle?.getAttribute('cy')).toBe('100');
  });

  it('should display owner color', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} />
      </svg>
    );
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('fill')).toBe('#FF0000');
  });

  it('should display default color when no owner', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} owner={null} />
      </svg>
    );
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('fill')).toBe('#666');
  });

  it('should display dice count', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} />
      </svg>
    );
    const texts = container.querySelectorAll('text');
    const diceText = Array.from(texts).find(t => t.textContent === '3');
    expect(diceText).toBeTruthy();
  });

  it('should display player name', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} />
      </svg>
    );
    const texts = container.querySelectorAll('text');
    const nameText = Array.from(texts).find(t => t.textContent === 'Test Player');
    expect(nameText).toBeTruthy();
  });

  it('should show "Empty" when no owner', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} owner={null} />
      </svg>
    );
    const texts = container.querySelectorAll('text');
    const nameText = Array.from(texts).find(t => t.textContent === 'Empty');
    expect(nameText).toBeTruthy();
  });

  it('should apply selected styling', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} isSelected={true} />
      </svg>
    );
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('stroke')).toBe('#FFD700');
    expect(circle?.getAttribute('stroke-width')).toBe('3');
  });

  it('should call onClick when clickable', () => {
    const onClick = vi.fn();
    const { container } = render(
      <svg>
        <Territory {...defaultProps} onClick={onClick} isClickable={true} />
      </svg>
    );
    const g = container.querySelector('g');
    if (g) {
      fireEvent.click(g);
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('should not call onClick when not clickable', () => {
    const onClick = vi.fn();
    const { container } = render(
      <svg>
        <Territory {...defaultProps} onClick={onClick} isClickable={false} isSelected={false} />
      </svg>
    );
    const g = container.querySelector('g');
    if (g) {
      fireEvent.click(g);
      expect(onClick).not.toHaveBeenCalled();
    }
  });

  it('should call onClick when selected even if not clickable', () => {
    const onClick = vi.fn();
    const { container } = render(
      <svg>
        <Territory {...defaultProps} onClick={onClick} isClickable={false} isSelected={true} />
      </svg>
    );
    const g = container.querySelector('g');
    if (g) {
      fireEvent.click(g);
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('should apply clickable class when clickable', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} isClickable={true} />
      </svg>
    );
    const g = container.querySelector('g');
    expect(g?.classList.contains('clickable')).toBe(true);
  });

  it('should apply selected class when selected', () => {
    const { container } = render(
      <svg>
        <Territory {...defaultProps} isSelected={true} />
      </svg>
    );
    const g = container.querySelector('g');
    expect(g?.classList.contains('selected')).toBe(true);
  });
});