/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
  it('should render basic card', () => {
    render(
      <Card>
        <CardContent>
          <p>Test content</p>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('Test content')).toBeDefined()
  })

  it('should render card with header and title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content here</p>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('Test Title')).toBeDefined()
    expect(screen.getByText('Content here')).toBeDefined()
  })

  it('should render card with description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>This is a description</CardDescription>
        </CardHeader>
      </Card>
    )
    
    expect(screen.getByText('This is a description')).toBeDefined()
  })

  it('should render card with footer', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByRole('button', { name: 'Action' })).toBeDefined()
  })

  it('should apply custom className to card', () => {
    render(
      <Card className="custom-card">
        <CardContent>Test</CardContent>
      </Card>
    )
    
    const card = screen.getByText('Test').closest('div')
    expect(card?.className).toContain('custom-card')
  })

  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>With all parts</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content area</p>
        </CardContent>
        <CardFooter>
          <span>Footer content</span>
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Complete Card')).toBeDefined()
    expect(screen.getByText('With all parts')).toBeDefined()
    expect(screen.getByText('Main content area')).toBeDefined()
    expect(screen.getByText('Footer content')).toBeDefined()
  })
}) 