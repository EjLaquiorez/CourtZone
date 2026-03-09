import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('Analytics event:', {
      name: body?.name,
      path: body?.path,
      timestamp: body?.timestamp,
      properties: body?.properties || {},
    })

    return NextResponse.json({
      success: true,
      message: 'Analytics event captured',
    })
  } catch (error) {
    console.error('Analytics capture error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to capture analytics event' },
      { status: 400 }
    )
  }
}
