/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })

  it('should call onChange handler', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    await user.type(input, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />)
    
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Input className="custom-class" placeholder="Test" />)
    
    const input = screen.getByPlaceholderText('Test')
    expect(input).toHaveClass('custom-class')
  })

  it('should handle different input types', () => {
    render(<Input type="password" placeholder="Password" />)
    
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should display default value', () => {
    render(<Input defaultValue="Default text" />)
    
    const input = screen.getByDisplayValue('Default text')
    expect(input).toBeInTheDocument()
  })

  it('should handle controlled value', () => {
    const { rerender } = render(<Input value="Initial" onChange={() => {}} />)
    
    let input = screen.getByDisplayValue('Initial')
    expect(input).toHaveValue('Initial')

    rerender(<Input value="Updated" onChange={() => {}} />)
    input = screen.getByDisplayValue('Updated')
    expect(input).toHaveValue('Updated')
  })
}) 