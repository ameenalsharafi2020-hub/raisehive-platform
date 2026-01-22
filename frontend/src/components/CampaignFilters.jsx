import { Select, SelectItem, Input } from '@nextui-org/react'
import { FiSearch } from 'react-icons/fi'

const CampaignFilters = ({ filters, onFilterChange }) => {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'film', label: 'Film & Video' },
    { value: 'games', label: 'Games' },
    { value: 'education', label: 'Education' },
    { value: 'charity', label: 'Charity' },
    { value: 'other', label: 'Other' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'successful', label: 'Successful' },
    { value: 'failed', label: 'Failed' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'ending', label: 'Ending Soon' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'funded', label: 'Most Funded' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <Input
          placeholder="Search campaigns..."
          startContent={<FiSearch />}
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />

        {/* Category */}
        <Select
          label="Category"
          selectedKeys={[filters.category || 'all']}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
        >
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </Select>

        {/* Status */}
        <Select
          label="Status"
          selectedKeys={[filters.status || 'all']}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        >
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </Select>

        {/* Sort */}
        <Select
          label="Sort By"
          selectedKeys={[filters.sort || 'newest']}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
        >
          {sortOptions.map((sort) => (
            <SelectItem key={sort.value} value={sort.value}>
              {sort.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default CampaignFilters