import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@phosphor-icons/react'

export default function ViewCampaign() {
  const { id } = useParams() // Lấy id từ URL
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/evm-staff/campaign')
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeftIcon size={24} />
            </button>
            <h1 className="text-3xl font-bold">Campaign Details</h1>
          </div>
          <p className="text-gray-500">Viewing details for Campaign {id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
        {/* Basic Info Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Campaign ID</p>
              <p className="font-medium">{id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                Active
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="font-medium">July 21, 2024</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">End Date</p>
              <p className="font-medium">August 21, 2024</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <p className="text-gray-600">
            Campaign description will be displayed here. You can fetch the actual campaign data
            using the ID: {id} from your API.
          </p>
        </div>
      </div>
    </div>
  )
}
