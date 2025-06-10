/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
  it('should render textarea with placeholder', () => {
    render(<Textarea placeholder="Enter text here" />)
    
    const textarea = screen.getByPlaceholderText('Enter text here')
    expect(textarea).toBeDefined()
    expect(textarea.tagName.toLowerCase()).toBe('textarea')
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder="Type here" />)
    
    const textarea = screen.getByPlaceholderText('Type here')
    await user.type(textarea, 'Hello World')
    
    expect(textarea).toHaveValue('Hello World')
  })

  it('should call onChange handler', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Textarea onChange={handleChange} placeholder="Test textarea" />)
    
    const textarea = screen.getByPlaceholderText('Test textarea')
    await user.type(textarea, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />)
    
    const textarea = screen.getByPlaceholderText('Disabled textarea')
    expect(textarea).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" placeholder="Test" />)
    
    const textarea = screen.getByPlaceholderText('Test')
    expect(textarea.className).toContain('custom-textarea')
  })

  it('should display default value', () => {
    render(<Textarea defaultValue="Default text content" />)
    
    const textarea = screen.getByDisplayValue('Default text content')
    expect(textarea).toBeDefined()
  })

  it('should handle controlled value', () => {
    const { rerender } = render(<Textarea value="Initial" onChange={() => {}} />)
    
    let textarea = screen.getByDisplayValue('Initial')
    expect(textarea).toHaveValue('Initial')

    rerender(<Textarea value="Updated" onChange={() => {}} />)
    textarea = screen.getByDisplayValue('Updated')
    expect(textarea).toHaveValue('Updated')
  })

  it('should support resize property', () => {
    render(<Textarea className="resize-none" placeholder="No resize" />)
    
    const textarea = screen.getByPlaceholderText('No resize')
    expect(textarea.className).toContain('resize-none')
  })

  it('should handle rows attribute', () => {
    render(<Textarea rows={5} placeholder="5 rows" />)
    
    const textarea = screen.getByPlaceholderText('5 rows')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('should handle onFocus and onBlur events', async () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(
      <Textarea 
        onFocus={handleFocus} 
        onBlur={handleBlur}
        placeholder="Focus test" 
      />
    )
    
    const textarea = screen.getByPlaceholderText('Focus test')
    
    fireEvent.focus(textarea)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(textarea)
    expect(handleBlur).toHaveBeenCalled()
  })
}) 