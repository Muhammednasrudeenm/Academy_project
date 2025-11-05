# Testing Guide

## Setup

Testing is configured using **Vitest** and **React Testing Library**.

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Files

### 1. API Tests (`src/api/api.test.js`)
Tests for API functions:
- `fetchAcademies` - With caching
- `fetchAcademyById` - Single academy fetch
- `toggleJoinAcademy` - Join/leave functionality
- `fetchJoinedAcademies` - User's joined academies
- `fetchMyAcademies` - User's created academies

### 2. Membership Utils Tests (`src/utils/membershipUtils.test.js`)
Tests for membership utility functions:
- `isUserMember` - Check if user is member
- `isUserCreator` - Check if user is creator
- `filterAcademiesByMembership` - Filter academies by membership

### 3. Event Handler Tests (`src/utils/eventHandlers.test.js`)
Tests for event handling:
- Event dispatch and listening
- Optimistic updates (join/leave)
- Event data structure validation

## Writing New Tests

### Example Test Structure

```javascript
import { describe, it, expect, vi } from 'vitest'
import { functionToTest } from './module'

describe('Function Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

## Mocking

### Mock Fetch

```javascript
global.fetch = vi.fn()

fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'mock' })
})
```

### Mock localStorage

```javascript
// Already set up in setup.js
localStorage.getItem = vi.fn(() => '{"user": {...}}')
```

### Mock Events

```javascript
const event = new CustomEvent('academyMembershipChanged', { 
  detail: { academyId: '123' } 
})
window.dispatchEvent(event)
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage for utility functions
- **API Tests**: 90%+ coverage for API functions
- **Component Tests**: Focus on critical user flows

## Running Specific Tests

```bash
# Run only API tests
npm test -- api

# Run only utility tests
npm test -- utils

# Run single test file
npm test -- api.test.js
```





