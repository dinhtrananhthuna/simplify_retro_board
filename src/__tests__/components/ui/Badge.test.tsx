/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>)
    
    const badge = screen.getByText('Test Badge')
    expect(badge).toBeDefined()
  })

  it('should render with default variant', () => {
    render(<Badge>Default</Badge>)
    
    const badge = screen.getByText('Default')
    expect(badge).toBeDefined()
    expect(badge.className).toContain('bg-primary')
  })

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    
    const badge = screen.getByText('Secondary')
    expect(badge).toBeDefined()
    expect(badge.className).toContain('bg-gray-200')
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    
    const badge = screen.getByText('Custom')
    expect(badge).toBeDefined()
    expect(badge.className).toContain('custom-class')
  })

  it('should render as span element by default', () => {
    render(<Badge>Span Badge</Badge>)
    
    const badge = screen.getByText('Span Badge')
    expect(badge.tagName.toLowerCase()).toBe('span')
  })

  it('should have correct base classes', () => {
    render(<Badge>Base Classes</Badge>)
    
    const badge = screen.getByText('Base Classes')
    expect(badge.className).toContain('inline-flex')
    expect(badge.className).toContain('items-center')
    expect(badge.className).toContain('rounded')
  })
}) 