import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../components/Button';

const meta = {
  title: 'Voxtir/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button'
  },
};

export const Text: Story = {
  args: {
    children: 'Button',
    variant: 'text'
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outlined'
  },
};

export const Large: Story = {
  args: {
    children: 'Button',
    size: 'large'
  },
};
