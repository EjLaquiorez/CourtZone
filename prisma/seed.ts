import { PrismaClient, Position, GameType, GameStatus, CourtType, Role } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

// Helper function to generate random data
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Basketball usernames and cities
const basketballUsernames = [
  'CourtKing23', 'HoopStar', 'BallHandler', 'SlamDunk99', 'ThreePointer', 'FastBreak',
  'Crossover', 'Shooter', 'Defender', 'Playmaker', 'Rebounder', 'Clutch', 'Baller',
  'Hooper', 'Swish', 'Dribbler', 'Dunker', 'Scorer', 'Passer', 'Blocker', 'Stealer',
  'FullCourt', 'HalfCourt', 'PickAndRoll', 'FadeAway', 'PostUp', 'Isolation', 'FastHands',
  'QuickFeet', 'HighFlyer', 'StreetBaller', 'GymRat', 'Competitor', 'Veteran', 'Rookie',
  'AllStar', 'MVP', 'Champion', 'Legend', 'Phenom', 'Prodigy', 'Maestro', 'Wizard',
  'Thunder', 'Lightning', 'Storm', 'Blaze', 'Fury', 'Venom', 'Phantom', 'Shadow'
]

const cities = [
  'Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle',
  'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
  'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque'
]

const positions = [Position.PG, Position.SG, Position.SF, Position.PF, Position.C]

// City coordinates for realistic location data
function getCityCoordinates(city: string): { lat: number; lng: number } {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Houston': { lat: 29.7604, lng: -95.3698 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Philadelphia': { lat: 39.9526, lng: -75.1652 },
    'San Antonio': { lat: 29.4241, lng: -98.4936 },
    'San Diego': { lat: 32.7157, lng: -117.1611 },
    'Dallas': { lat: 32.7767, lng: -96.7970 },
    'San Jose': { lat: 37.3382, lng: -121.8863 },
    'Austin': { lat: 30.2672, lng: -97.7431 },
    'Jacksonville': { lat: 30.3322, lng: -81.6557 },
    'Fort Worth': { lat: 32.7555, lng: -97.3308 },
    'Columbus': { lat: 39.9612, lng: -82.9988 },
    'Charlotte': { lat: 35.2271, lng: -80.8431 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Indianapolis': { lat: 39.7684, lng: -86.1581 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Washington': { lat: 38.9072, lng: -77.0369 },
    'Boston': { lat: 42.3601, lng: -71.0589 },
    'El Paso': { lat: 31.7619, lng: -106.4850 },
    'Nashville': { lat: 36.1627, lng: -86.7816 },
    'Detroit': { lat: 42.3314, lng: -83.0458 },
    'Oklahoma City': { lat: 35.4676, lng: -97.5164 },
    'Portland': { lat: 45.5152, lng: -122.6784 },
    'Las Vegas': { lat: 36.1699, lng: -115.1398 },
    'Memphis': { lat: 35.1495, lng: -90.0490 },
    'Louisville': { lat: 38.2527, lng: -85.7585 },
    'Baltimore': { lat: 39.2904, lng: -76.6122 },
    'Milwaukee': { lat: 43.0389, lng: -87.9065 },
    'Albuquerque': { lat: 35.0844, lng: -106.6504 }
  }

  return cityCoords[city] || { lat: 34.0522, lng: -118.2437 } // Default to LA
}

async function main() {
  console.log('🌱 Starting comprehensive database seed...')

  // Create demo users with realistic data
  const hashedPassword = await hashPassword('password123')

  const user1 = await prisma.user.upsert({
    where: { email: 'courtking@example.com' },
    update: {},
    create: {
      email: 'courtking@example.com',
      username: 'CourtKing23',
      password: hashedPassword,
      position: Position.PG,
      skillLevel: 8,
      rating: 1847,
      latitude: 34.0522,
      longitude: -118.2437,
      city: 'Los Angeles',
      isVerified: true,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'hoopstar@example.com' },
    update: {},
    create: {
      email: 'hoopstar@example.com',
      username: 'HoopStar',
      password: hashedPassword,
      position: Position.SG,
      skillLevel: 7,
      rating: 1654,
      latitude: 34.0689,
      longitude: -118.4452,
      city: 'Los Angeles',
      isVerified: true,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'ballhandler@example.com' },
    update: {},
    create: {
      email: 'ballhandler@example.com',
      username: 'BallHandler',
      password: hashedPassword,
      position: Position.SF,
      skillLevel: 9,
      rating: 2156,
      latitude: 33.9850,
      longitude: -118.4695,
      city: 'Venice',
      isVerified: true,
    },
  })

  console.log('✅ Created initial demo users')

  // Create additional users for realistic data
  const additionalUsers = []
  for (let i = 0; i < 47; i++) {
    const username = `${getRandomElement(basketballUsernames)}${getRandomInt(1, 999)}`
    const city = getRandomElement(cities)
    const skillLevel = getRandomInt(1, 10)
    const rating = getRandomInt(800, 2500)
    const position = getRandomElement(positions)

    // Generate realistic coordinates for major cities
    const cityCoords = getCityCoordinates(city)

    try {
      const user = await prisma.user.create({
        data: {
          email: `${username.toLowerCase()}@example.com`,
          username,
          password: hashedPassword,
          position,
          skillLevel,
          rating,
          latitude: cityCoords.lat + (Math.random() - 0.5) * 0.1, // Add some variance
          longitude: cityCoords.lng + (Math.random() - 0.5) * 0.1,
          city,
          maxDistance: getRandomInt(5, 50),
          isVerified: Math.random() > 0.3, // 70% verified
        }
      })
      additionalUsers.push(user)
    } catch (error) {
      // Skip if username/email already exists
      console.log(`Skipped duplicate user: ${username}`)
    }
  }

  console.log(`✅ Created ${additionalUsers.length} additional users`)

  // Create courts
  const court1 = await prisma.court.upsert({
    where: { id: 'court-1' },
    update: {},
    create: {
      id: 'court-1',
      name: 'Venice Beach Basketball Courts',
      address: '1800 Ocean Front Walk, Venice, CA 90291',
      latitude: 33.9850,
      longitude: -118.4695,
      courtType: CourtType.OUTDOOR,
      surfaceType: 'Asphalt',
      hasLighting: true,
      hasParking: true,
      rating: 4.5,
      reviewCount: 127,
      isVerified: true,
      amenities: ['Restrooms', 'Water Fountain', 'Nearby Food', 'Beach Access'],
      photos: ['/courts/venice-1.jpg', '/courts/venice-2.jpg'],
      createdBy: { connect: { id: user1.id } }
    },
  })

  const court2 = await prisma.court.upsert({
    where: { id: 'court-2' },
    update: {},
    create: {
      id: 'court-2',
      name: 'Downtown Athletic Club',
      address: '123 S Figueroa St, Los Angeles, CA 90015',
      latitude: 34.0522,
      longitude: -118.2437,
      courtType: CourtType.INDOOR,
      surfaceType: 'Hardwood',
      hasLighting: true,
      hasParking: true,
      rating: 4.8,
      reviewCount: 89,
      isVerified: true,
      amenities: ['Locker Rooms', 'Showers', 'Pro Shop', 'Cafe', 'Air Conditioning'],
      photos: ['/courts/downtown-1.jpg', '/courts/downtown-2.jpg'],
      createdBy: { connect: { id: user2.id } }
    },
  })

  const court3 = await prisma.court.upsert({
    where: { id: 'court-3' },
    update: {},
    create: {
      id: 'court-3',
      name: 'UCLA Recreation Center',
      address: '221 Westwood Plaza, Los Angeles, CA 90095',
      latitude: 34.0689,
      longitude: -118.4452,
      courtType: CourtType.INDOOR,
      surfaceType: 'Hardwood',
      hasLighting: true,
      hasParking: true,
      rating: 4.7,
      reviewCount: 67,
      isVerified: true,
      amenities: ['Student Discounts', 'Equipment Rental', 'Fitness Center', 'Pool'],
      photos: ['/courts/ucla-1.jpg', '/courts/ucla-2.jpg'],
      createdBy: { connect: { id: user3.id } }
    },
  })

  console.log('✅ Created demo courts')

  // Create teams
  const team1 = await prisma.team.upsert({
    where: { id: 'team-1' },
    update: {},
    create: {
      id: 'team-1',
      name: 'Thunder Bolts',
      description: 'Competitive team looking for skilled players. We practice twice a week and compete in local tournaments.',
      maxSize: 12,
      minSkillLevel: 6,
      maxSkillLevel: 10,
      isPublic: true,
      rating: 1892,
      gamesPlayed: 45,
      wins: 32,
      captain: { connect: { id: user1.id } }
    },
  })

  const team2 = await prisma.team.upsert({
    where: { id: 'team-2' },
    update: {},
    create: {
      id: 'team-2',
      name: 'Street Warriors',
      description: 'Casual team for weekend games. All skill levels welcome!',
      maxSize: 10,
      minSkillLevel: 4,
      maxSkillLevel: 8,
      isPublic: true,
      rating: 1654,
      gamesPlayed: 28,
      wins: 18,
      captain: { connect: { id: user2.id } }
    },
  })

  console.log('✅ Created demo teams')

  // Add team members
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: user1.id } },
    update: {},
    create: {
      teamId: team1.id,
      userId: user1.id,
      role: 'CAPTAIN',
      position: Position.PG,
      isStarter: true,
    },
  })

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team2.id, userId: user2.id } },
    update: {},
    create: {
      teamId: team2.id,
      userId: user2.id,
      role: 'CAPTAIN',
      position: Position.SG,
      isStarter: true,
    },
  })

  console.log('✅ Created team memberships')

  // Create games
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(18, 0, 0, 0)

  const game1 = await prisma.game.upsert({
    where: { id: 'game-1' },
    update: {},
    create: {
      id: 'game-1',
      title: 'Friday Night Pickup',
      description: 'Competitive pickup game. All skill levels welcome! Bring your A-game.',
      gameType: GameType.PICKUP,
      status: GameStatus.SCHEDULED,
      scheduledAt: tomorrow,
      duration: 120,
      maxPlayers: 10,
      skillLevelMin: 4,
      skillLevelMax: 8,
      isPrivate: false,
      organizer: { connect: { id: user1.id } },
      court: { connect: { id: court1.id } },
      hostTeam: { connect: { id: team1.id } }
    },
  })

  console.log('✅ Created demo games')

  // Create court reviews
  await prisma.courtReview.upsert({
    where: { courtId_userId: { courtId: court1.id, userId: user2.id } },
    update: {},
    create: {
      courtId: court1.id,
      userId: user2.id,
      rating: 5,
      comment: 'Amazing courts with great ocean views! Perfect for pickup games.',
    },
  })

  await prisma.courtReview.upsert({
    where: { courtId_userId: { courtId: court2.id, userId: user3.id } },
    update: {},
    create: {
      courtId: court2.id,
      userId: user3.id,
      rating: 5,
      comment: 'Professional quality indoor courts. Great for serious training.',
    },
  })

  console.log('✅ Created court reviews')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
