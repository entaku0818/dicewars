import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dice from './Dice';

describe('Dice', () => {
  it('should render dice with correct value', () => {
    const { container } = render(<Dice value={3} />);
    const dots = container.querySelectorAll('circle');
    // 3 dots for value 3
    expect(dots.length).toBe(3);
  });

  it('should render 1 dot for value 1', () => {
    const { container } = render(<Dice value={1} />);
    const dots = container.querySelectorAll('circle');
    expect(dots.length).toBe(1);
  });

  it('should render 6 dots for value 6', () => {
    const { container } = render(<Dice value={6} />);
    const dots = container.querySelectorAll('circle');
    expect(dots.length).toBe(6);
  });

  it('should apply custom color', () => {
    const { container } = render(<Dice value={1} color="#FF0000" />);
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke')).toBe('#FF0000');
  });

  it('should apply custom size', () => {
    const { container } = render(<Dice value={1} size={50} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('50');
    expect(svg?.getAttribute('height')).toBe('50');
  });

  it('should apply rolling animation class', () => {
    const { container } = render(<Dice value={1} isRolling={true} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('rolling')).toBe(true);
  });

  it('should not apply rolling animation class when not rolling', () => {
    const { container } = render(<Dice value={1} isRolling={false} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('rolling')).toBe(false);
  });

  it('should handle values outside 1-6 range', () => {
    const { container: container1 } = render(<Dice value={0} />);
    const dots1 = container1.querySelectorAll('circle');
    expect(dots1.length).toBe(1); // Should default to 1

    const { container: container2 } = render(<Dice value={7} />);
    const dots2 = container2.querySelectorAll('circle');
    expect(dots2.length).toBe(6); // Should cap at 6
  });
});