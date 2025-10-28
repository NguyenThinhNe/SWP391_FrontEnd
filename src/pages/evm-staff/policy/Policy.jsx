import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretRight, DownloadSimple } from '@phosphor-icons/react'

const policies = [
  {
    id: 'P-001',
    title: 'Warranty Coverage - VF Series',
    effective: '2024-01-01',
    summary: 'Covers drivetrain and battery for up to 5 years or 60,000 km',
  },
  {
    id: 'P-002',
    title: 'Trim & Accessory Policy',
    effective: '2023-07-01',
    summary: 'Accessory installation rules and approved vendors',
  },
]

export default function Policy() {
  const navigate = useNavigate()

  const handleViewPolicy = (policyId) => {
    navigate(`/evm-staff/policy/${policyId}`)
  }
  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-black text-3xl font-bold">Policy</h1>
          <p className="text-gray-500">Company policies and warranty documents for EVM staff.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {policies.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{p.title}</div>
                <div className="text-sm text-gray-500">Effective: {p.effective}</div>
              </div>
              <div className="text-sm text-indigo-600 font-medium">{p.id}</div>
            </div>
            <p className="text-gray-600 mt-3">{p.summary}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleViewPolicy(p.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
              >
                View
                <CaretRight size={16} />
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition-colors">
                Download
                <DownloadSimple size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">All Policies</h2>
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-4 w-1/6">Policy ID</th>
                <th className="py-3 px-4 w-1/4">Title</th>
                <th className="py-3 px-4 w-1/6">Effective</th>
                <th className="py-3 px-4 w-1/4">Summary</th>
                <th className="py-3 px-4 w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-3 px-4">{p.id}</td>
                  <td className="py-3 px-4">{p.title}</td>
                  <td className="py-3 px-4">{p.effective}</td>
                  <td className="py-3 px-4">{p.summary}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewPolicy(p.id)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

