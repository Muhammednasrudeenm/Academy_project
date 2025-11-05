import { describe, it, expect } from 'vitest'

/**
 * Utility functions for membership testing
 */

// Check if user is a member of an academy
export const isUserMember = (academy, userId) => {
  if (!academy?.members || !userId) return false
  
  return academy.members.some((m) => {
    const memberId = m.userId?._id || m.userId
    return String(memberId) === String(userId) || memberId === userId
  })
}

// Check if user is creator of an academy
export const isUserCreator = (academy, userId) => {
  if (!academy?.createdBy || !userId) return false
  
  const createdById = academy.createdBy?._id || academy.createdBy
  return createdById?.toString() === userId?.toString() || createdById === userId
}

// Filter academies by membership status
export const filterAcademiesByMembership = (academies, userId, joined = true) => {
  return academies.filter(academy => {
    const isMember = isUserMember(academy, userId)
    return joined ? isMember : !isMember
  })
}

describe('Membership Utilities', () => {
  describe('isUserMember', () => {
    it('should return true when user is a member', () => {
      const academy = {
        _id: '123',
        members: [
          { userId: { _id: 'user1' } },
          { userId: 'user2' }
        ]
      }

      expect(isUserMember(academy, 'user1')).toBe(true)
      expect(isUserMember(academy, 'user2')).toBe(true)
    })

    it('should return false when user is not a member', () => {
      const academy = {
        _id: '123',
        members: [{ userId: 'user1' }]
      }

      expect(isUserMember(academy, 'user2')).toBe(false)
    })

    it('should handle empty members array', () => {
      const academy = {
        _id: '123',
        members: []
      }

      expect(isUserMember(academy, 'user1')).toBe(false)
    })

    it('should handle missing members property', () => {
      const academy = { _id: '123' }
      expect(isUserMember(academy, 'user1')).toBe(false)
    })

    it('should handle string userId in members', () => {
      const academy = {
        _id: '123',
        members: [{ userId: 'user1' }]
      }

      expect(isUserMember(academy, 'user1')).toBe(true)
    })
  })

  describe('isUserCreator', () => {
    it('should return true when user is creator', () => {
      const academy = {
        _id: '123',
        createdBy: { _id: 'user1' }
      }

      expect(isUserCreator(academy, 'user1')).toBe(true)
    })

    it('should handle string createdBy', () => {
      const academy = {
        _id: '123',
        createdBy: 'user1'
      }

      expect(isUserCreator(academy, 'user1')).toBe(true)
    })

    it('should return false when user is not creator', () => {
      const academy = {
        _id: '123',
        createdBy: 'user1'
      }

      expect(isUserCreator(academy, 'user2')).toBe(false)
    })

    it('should handle missing createdBy', () => {
      const academy = { _id: '123' }
      expect(isUserCreator(academy, 'user1')).toBe(false)
    })
  })

  describe('filterAcademiesByMembership', () => {
    it('should filter joined academies', () => {
      const academies = [
        { _id: '1', members: [{ userId: 'user1' }] },
        { _id: '2', members: [{ userId: 'user2' }] },
        { _id: '3', members: [] }
      ]

      const joined = filterAcademiesByMembership(academies, 'user1', true)
      expect(joined).toHaveLength(1)
      expect(joined[0]._id).toBe('1')
    })

    it('should filter not joined academies', () => {
      const academies = [
        { _id: '1', members: [{ userId: 'user1' }] },
        { _id: '2', members: [{ userId: 'user2' }] },
        { _id: '3', members: [] }
      ]

      const notJoined = filterAcademiesByMembership(academies, 'user1', false)
      expect(notJoined).toHaveLength(2)
      expect(notJoined.map(a => a._id)).toEqual(['2', '3'])
    })
  })
})





