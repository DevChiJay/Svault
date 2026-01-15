/**
 * Component Tests for EmptyState
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyState from '../components/common/EmptyState';

// Mock FadeInView to avoid animation timing issues in tests
jest.mock('../components/common/FadeInView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, style }: any) => <View style={style}>{children}</View>;
});

describe('EmptyState Component', () => {
  it('should render with required props', () => {
    const { getByText } = render(
      <EmptyState
        icon="lock-closed"
        title="No Passwords"
        description="You haven't added any passwords yet"
      />
    );

    expect(getByText('No Passwords')).toBeTruthy();
    expect(getByText("You haven't added any passwords yet")).toBeTruthy();
  });

  it('should render action button when provided', () => {
    const mockAction = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon="lock-closed"
        title="No Passwords"
        description="You haven't added any passwords yet"
        actionLabel="Add Password"
        onAction={mockAction}
      />
    );

    const button = getByText('Add Password');
    expect(button).toBeTruthy();
  });

  it('should call onAction when button is pressed', () => {
    const mockAction = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon="lock-closed"
        title="No Passwords"
        description="You haven't added any passwords yet"
        actionLabel="Add Password"
        onAction={mockAction}
      />
    );

    fireEvent.press(getByText('Add Password'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should not render action button without onAction', () => {
    const { queryByText } = render(
      <EmptyState
        icon="lock-closed"
        title="No Passwords"
        description="You haven't added any passwords yet"
        actionLabel="Add Password"
      />
    );

    expect(queryByText('Add Password')).toBeNull();
  });
});
