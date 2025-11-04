import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, DotsThree, CalendarBlank, CaretLeft, CaretRight } from 'phosphor-react'
import { useSCStaffApi } from '../../../../api/useSCStaffApi'
import Loader from '../../../../components/Loader'

const StatsCard = ({ title, count, subtitle, icon: Icon }) => (
  <div className="border-[3px] border-[#EBEBEB] rounded-2xl p-8 min-w-[492px]">
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-xl font-medium text-[#626AE7]">{title}</h3>
      {Icon && <Icon size={27} className="text-[#686262]" />}
    </div>
    <div className="text-[30px] font-semibold text-black mb-2">{count}</div>
    <div className="text-base font-medium text-[#686262]">{subtitle}</div>
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const { claims, stats, loading, error, fetchClaims } = useSCStaffApi()
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    fetchClaims()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Format claims data for display
  const formattedClaims = claims.map(claim => ({
    id: claim.id || claim.claimId || 'N/A',
    vehicle: claim.vehicle || claim.vehicleName || 'Unknown Vehicle',
    vin: claim.vin || 'N/A',
    requester: claim.requester || claim.requesterName || claim.technicianName || 'N/A',
    date: claim.date || claim.claimDate ? new Date(claim.date || claim.claimDate).toISOString().split('T')[0] : 'N/A'
  }))

  if (loading && claims.length === 0) return <Loader />
  if (error) console.error("Dashboard error:", error)

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index)
  }

  const handleViewDetails = (claimId) => {
    // Navigate to existing WarrantyRequestDetail page
    navigate(`/sc-staff/warranty-request/${claimId}`);
    setOpenDropdown(null);
  }

  return (
    <div className="p-12 w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[30px] font-semibold text-black mb-1">Hello, SC Staff!</h1>
          <p className="text-xl font-semibold text-[#929594]">An overview of your works.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-semibold text-[#393C3B]">16 May, 2025</span>
          <div className="w-[45px] h-[45px] rounded-full bg-[#F1F3F4] flex items-center justify-center">
            <CalendarBlank size={25} className="text-black" />
          </div>
        </div>
      </div>

      <div className="flex gap-8 mb-12">
        <StatsCard 
          title="Total Claims" 
          count="12" 
          subtitle="Currently in your queue" 
        />
        <StatsCard 
          title="Accepted Requests" 
          count="04" 
          subtitle="Currently in your queue" 
          icon={CheckCircle}
        />
      </div>

      <div>
        <h2 className="text-[25px] font-semibold text-black mb-6">Newest Received Claims</h2>
        
        <div className="border-[3px] border-[#EBEBEB] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#DEE1E6] bg-[#FAFAFA]">
                <th className="text-left px-8 py-3 text-base font-medium text-[#686262]">Claim ID</th>
                <th className="text-left px-8 py-3 text-base font-medium text-[#686262]">Vehicle</th>
                <th className="text-left px-8 py-3 text-base font-medium text-[#686262]">Vin ID</th>
                <th className="text-left px-8 py-3 text-base font-medium text-[#686262]">Sent Date</th>
                <th className="text-left px-8 py-3 text-base font-medium text-[#686262]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formattedClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-8 text-center text-gray-500">
                    No claims found
                  </td>
                </tr>
              ) : (
                formattedClaims.map((claim, index) => (
                <tr key={index} className="border-b-2 border-[#DEE1E6] bg-white hover:bg-gray-50">
                  <td className="px-8 py-3 text-[13px] font-medium text-black">{claim.id}</td>
                  <td className="px-8 py-3 text-[13px] font-medium text-black">{claim.vehicle}</td>
                  <td className="px-8 py-3 text-[13px] font-medium text-black">{claim.vin}</td>
                  <td className="px-8 py-3 text-[13px] font-medium text-black">{claim.date}</td>
                  <td className="px-8 py-3 relative">
                    <button 
                      onClick={() => toggleDropdown(index)}
                      className="p-2 hover:bg-gray-100 rounded bg-transparent border-none cursor-pointer"
                    >
                      <DotsThree size={24} weight="bold" className="text-gray-700" />
                    </button>
                    
                    {openDropdown === index && (
                      <div className="absolute right-8 top-12 z-10">
                        <button
                          className="px-6 py-3 border border-[#E5E5E5] rounded-xl bg-white shadow-md text-sm font-medium text-black hover:bg-gray-50 whitespace-nowrap"
                          onClick={() => handleViewDetails(claim.id)}
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
          
          <div className="flex items-center justify-between px-8 py-6 bg-white">
            <span className="text-[12px] font-normal text-black">Showing {formattedClaims.length} of {stats.totalClaims} results</span>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 bg-white text-[12px] font-semibold text-black hover:text-[#626AE7] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <CaretLeft size={10} />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-[12px] font-medium flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? 'bg-[#626AE7] text-white'
                        : 'bg-white text-[#727674] hover:text-black'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 bg-white text-[12px] font-medium text-black hover:text-[#626AE7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <CaretRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
