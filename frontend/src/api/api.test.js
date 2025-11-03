import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  fetchAcademies, 
  fetchAcademyById, 
  toggleJoinAcademy,
  fetchJoinedAcademies,
  fetchMyAcademies 
} from './api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear cache
    vi.spyOn(global, 'Date').mockImplementation(() => ({
      now: () => 1000000,
      valueOf: () => 1000000
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchAcademies', () => {
    it('should fetch academies from API', async () => {
      const mockAcademies = {
        success: true,
        data: [
          { _id: '1', name: 'Academy 1' },
          { _id: '2', name: 'Academy 2' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAcademies
      })

      const result = await fetchAcademies(true)

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/academies')
      expect(result).toEqual(mockAcademies)
    })

    it('should use cache when not forcing refresh', async () => {
      const mockAcademies = {
        success: true,
        data: [{ _id: '1', name: 'Cached Academy' }]
      }

      // First call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAcademies
      })

      await fetchAcademies(true)
      vi.clearAllMocks()

      // Second call should use cache
      const result = await fetchAcademies(false)
      
      expect(fetch).not.toHaveBeenCalled()
      expect(result).toEqual(mockAcademies)
    })

    it('should throw error when API fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(fetchAcademies(true)).rejects.toThrow('Failed to fetch academies')
    })
  })

  describe('fetchAcademyById', () => {
    it('should fetch a single academy by ID', async () => {
      const mockAcademy = {
        success: true,
        data: { _id: '123', name: 'Test Academy' }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAcademy
      })

      const result = await fetchAcademyById('123')

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/academies/123')
      expect(result).toEqual(mockAcademy.data)
    })

    it('should handle response without data property', async () => {
      const mockAcademy = { _id: '123', name: 'Test Academy' }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAcademy
      })

      const result = await fetchAcademyById('123')

      expect(result).toEqual(mockAcademy)
    })

    it('should throw error when academy not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(fetchAcademyById('invalid')).rejects.toThrow('Failed to fetch academy details')
    })
  })

  describe('toggleJoinAcademy', () => {
    it('should join an academy successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          _id: '123',
          name: 'Test Academy',
          members: [{ userId: 'user1' }]
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await toggleJoinAcademy('123', 'user1')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/academies/123/toggle-join',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'user1' })
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should leave an academy successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          _id: '123',
          name: 'Test Academy',
          members: []
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await toggleJoinAcademy('123', 'user1')

      expect(result.success).toBe(true)
      expect(result.data.members).toEqual([])
    })

    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Already a member' })
      })

      // The function throws the actual error message from the API
      await expect(toggleJoinAcademy('123', 'user1')).rejects.toThrow()
    })
  })

  describe('fetchJoinedAcademies', () => {
    it('should fetch joined academies for a user', async () => {
      const mockJoined = {
        success: true,
        data: [
          { _id: '1', name: 'Joined Academy 1' },
          { _id: '2', name: 'Joined Academy 2' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJoined
      })

      const result = await fetchJoinedAcademies('user1')

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/academies/user/user1/joined')
      expect(result).toEqual(mockJoined)
    })
  })

  describe('fetchMyAcademies', () => {
    it('should fetch created academies for a user', async () => {
      const mockMyAcademies = {
        success: true,
        data: [
          { _id: '1', name: 'My Academy 1', createdBy: 'user1' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMyAcademies
      })

      const result = await fetchMyAcademies('user1')

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/academies/user/user1/created')
      expect(result).toEqual(mockMyAcademies)
    })
  })
})

