'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { monitoringService } from '../services/monitoringService'
import ApiDoc from './ApiDoc'
import { ArrowLeft, Loader2 } from 'lucide-react'

const ApiDocPage = () => {
  const params = useParams()
  const appId = params?.appId as string
  const router = useRouter()
  const [appDetail, setAppDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appId) return

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const detail = await monitoringService.getAppDetail(appId)
        setAppDetail(detail)
      } catch (err) {
        setError('Failed to fetch app detail')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [appId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p className="mb-4">{error}</p>
        <button onClick={() => router.back()} className="text-primary-600 hover:underline">返回</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">API 文档</h1>
      </div>
      <ApiDoc appDetail={appDetail} />
    </div>
  )
}

export default ApiDocPage
