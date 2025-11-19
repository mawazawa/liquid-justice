import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatefulButton, type ProcessStep } from './stateful-button';

describe('StatefulButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const mockProcessSteps: ProcessStep[] = [
    { name: 'Validating', duration: 500 },
    { name: 'Processing', duration: 300 },
    { name: 'Saving', duration: 200 },
  ];

  it('renders in idle state initially', () => {
    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Click Me
      </StatefulButton>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('starts processing when clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Submit
      </StatefulButton>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/validating/i)).toBeInTheDocument();
    });
  });

  it('shows chronometer during processing', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/0\.\ds/)).toBeInTheDocument();
    });
  });

  it('progresses through all steps', async () => {
    const user = userEvent.setup({ delay: null });
    const onComplete = vi.fn();

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={onComplete}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));

    // First step
    await waitFor(() => {
      expect(screen.getByText(/validating/i)).toBeInTheDocument();
    });

    // Advance through first step duration
    vi.advanceTimersByTime(500);

    // Second step
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    // Advance through second step
    vi.advanceTimersByTime(300);

    // Third step
    await waitFor(() => {
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    // Complete final step
    vi.advanceTimersByTime(200);

    // Success state
    await waitFor(() => {
      expect(screen.getByText(/complete/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete when all steps finish', async () => {
    const user = userEvent.setup({ delay: null });
    const onComplete = vi.fn();

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={onComplete}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));

    // Fast-forward through all steps
    vi.advanceTimersByTime(500 + 300 + 200);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('shows success message after completion', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StatefulButton
        processSteps={mockProcessSteps}
        onComplete={vi.fn()}
        successMessage="Done!"
      >
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));
    vi.advanceTimersByTime(1000); // Complete all steps

    await waitFor(() => {
      expect(screen.getByText('Done!')).toBeInTheDocument();
    });
  });

  it('returns to idle after celebration duration', async () => {
    const user = userEvent.setup({ delay: null });
    const celebrationDuration = 2000;

    render(
      <StatefulButton
        processSteps={mockProcessSteps}
        onComplete={vi.fn()}
        celebrationDuration={celebrationDuration}
      >
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));

    // Complete all steps
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText(/complete/i)).toBeInTheDocument();
    });

    // Wait for celebration to end
    vi.advanceTimersByTime(celebrationDuration);

    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  it('is disabled during processing', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Submit
      </StatefulButton>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('respects disabled prop', () => {
    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()} disabled>
        Submit
      </StatefulButton>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles async onComplete function', async () => {
    const user = userEvent.setup({ delay: null });
    const asyncComplete = vi.fn().mockResolvedValue(undefined);

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={asyncComplete}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(asyncComplete).toHaveBeenCalled();
    });
  });

  it('handles onComplete errors gracefully', async () => {
    const user = userEvent.setup({ delay: null });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failingComplete = vi.fn().mockRejectedValue(new Error('Test error'));

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={failingComplete}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('shows ultra-fast spinner during processing', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin-ultra-fast');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('shows checkmark on success', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      const checkmark = document.querySelector('.animate-in.zoom-in');
      expect(checkmark).toBeInTheDocument();
    });
  });

  it('expands width during processing', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Submit
      </StatefulButton>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveClass('min-w-[280px]');
    });
  });

  it('applies success background color', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StatefulButton processSteps={mockProcessSteps} onComplete={vi.fn()}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600');
    });
  });

  it('respects minimum step duration of 300ms', async () => {
    const user = userEvent.setup({ delay: null });
    const quickSteps: ProcessStep[] = [
      { name: 'Quick', duration: 50 }, // Less than minimum
    ];
    const onComplete = vi.fn();

    render(
      <StatefulButton processSteps={quickSteps} onComplete={onComplete}>
        Submit
      </StatefulButton>
    );

    await user.click(screen.getByRole('button'));

    // Should not complete before 300ms
    vi.advanceTimersByTime(100);
    expect(onComplete).not.toHaveBeenCalled();

    // Should complete after 300ms
    vi.advanceTimersByTime(200);
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('merges custom className', () => {
    render(
      <StatefulButton
        processSteps={mockProcessSteps}
        onComplete={vi.fn()}
        className="custom-button"
      >
        Submit
      </StatefulButton>
    );

    expect(screen.getByRole('button')).toHaveClass('custom-button');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <StatefulButton
        ref={ref as React.RefObject<HTMLButtonElement>}
        processSteps={mockProcessSteps}
        onComplete={vi.fn()}
      >
        Submit
      </StatefulButton>
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('supports custom button props', () => {
    render(
      <StatefulButton
        processSteps={mockProcessSteps}
        onComplete={vi.fn()}
        variant="destructive"
        size="lg"
        aria-label="Custom submit"
      >
        Submit
      </StatefulButton>
    );

    const button = screen.getByRole('button', { name: /custom submit/i });
    expect(button).toHaveClass('bg-destructive', 'h-12');
  });
});
