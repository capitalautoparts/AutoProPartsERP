import React, { useState, useMemo } from 'react';
import { SearchableSelect } from './SearchableSelect';

interface ApplicationMappingTableProps {
  applications: any[];
  allMakes: any[];
  allModels: any[];
  components: any;
  vehicleSystemsRefData: any;
  transmissionRefData: any;
  physicalSpecsRefData: any;
  pcdbRefData: any;
  engineFilters: any;
  transmissionFilters: any;
  vehicleSystemsFilters: any;
  physicalSpecsFilters: any;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  showConditionalColumns?: boolean;
}

export const ApplicationMappingTable: React.FC<ApplicationMappingTableProps> = ({
  applications,
  allMakes,
  allModels,
  components,
  vehicleSystemsRefData,
  transmissionRefData,
  physicalSpecsRefData,
  pcdbRefData,
  engineFilters,
  transmissionFilters,
  vehicleSystemsFilters,
  physicalSpecsFilters,
  onEdit,
  onRemove,
  showConditionalColumns = true
}) => {
  const [filters, setFilters] = useState({
    year: '',
    make: '',
    model: '',
    submodel: '',
    driveType: '',
    partType: '',
    position: '',
    mfrLabel: '',
    liter: '',
    transmissionControl: '',
    frontSpring: '',
    rearSpring: '',
    steeringType: '',
    steeringSystem: '',
    wheelbaseInches: '',
    bedLengthInches: '',
    bodyType: '',
    numDoors: ''
  });

  const [sortConfig, setSortConfig] = useState({ field: 'year', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const sortedAndFilteredApplications = useMemo(() => {
    const filtered = applications.filter(app => {
      const yearName = app.year;
      const makeName = allMakes.find(m => m.MakeID === app.make)?.MakeName || app.make;
      const modelName = allModels.find(m => m.ModelID === app.model)?.ModelName || app.model;
      const submodelName = components.subModels.find(sm => sm.SubModelID === app.submodel)?.displayName || app.submodel || '';
      const driveTypeName = vehicleSystemsRefData.driveTypes?.find(dt => dt.DriveTypeID === (app.driveType || vehicleSystemsFilters.driveType))?.DriveTypeName || app.driveType || vehicleSystemsFilters.driveType || '';
      const partTypeName = pcdbRefData.partTypes?.find(pt => pt.PartTerminologyID === app.partType)?.PartTerminologyName || app.partType || '';
      const positionName = pcdbRefData.positions?.find(pos => pos.PositionID === app.position)?.Position || app.position || '';
      
      return (
        (!filters.year || yearName.toString().includes(filters.year)) &&
        (!filters.make || makeName.toLowerCase().includes(filters.make.toLowerCase())) &&
        (!filters.model || modelName.toLowerCase().includes(filters.model.toLowerCase())) &&
        (!filters.submodel || submodelName.toLowerCase().includes(filters.submodel.toLowerCase())) &&
        (!filters.driveType || driveTypeName.toLowerCase().includes(filters.driveType.toLowerCase())) &&
        (!filters.partType || partTypeName.toLowerCase().includes(filters.partType.toLowerCase())) &&
        (!filters.position || positionName.toLowerCase().includes(filters.position.toLowerCase())) &&
        (!filters.mfrLabel || (app.mfrLabel || '').toLowerCase().includes(filters.mfrLabel.toLowerCase())) &&
        (!filters.liter || (app.liter || '').includes(filters.liter)) &&
        (!filters.transmissionControl || (app.transmissionControl || '').includes(filters.transmissionControl)) &&
        (!filters.frontSpring || (app.frontSpring || '').includes(filters.frontSpring)) &&
        (!filters.rearSpring || (app.rearSpring || '').includes(filters.rearSpring)) &&
        (!filters.steeringType || (app.steeringType || '').includes(filters.steeringType)) &&
        (!filters.steeringSystem || (app.steeringSystem || '').includes(filters.steeringSystem)) &&
        (!filters.wheelbaseInches || (app.wheelbaseInches || '').includes(filters.wheelbaseInches)) &&
        (!filters.bedLengthInches || (app.bedLengthInches || '').includes(filters.bedLengthInches)) &&
        (!filters.bodyType || (app.bodyType || '').includes(filters.bodyType)) &&
        (!filters.numDoors || (app.numDoors || '').includes(filters.numDoors))
      );
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.field) {
        case 'year':
          aValue = parseInt(a.year) || 0;
          bValue = parseInt(b.year) || 0;
          break;
        case 'make':
          aValue = allMakes.find(m => m.MakeID === a.make)?.MakeName || a.make || '';
          bValue = allMakes.find(m => m.MakeID === b.make)?.MakeName || b.make || '';
          break;
        case 'model':
          aValue = allModels.find(m => m.ModelID === a.model)?.ModelName || a.model || '';
          bValue = allModels.find(m => m.ModelID === b.model)?.ModelName || b.model || '';
          break;
        case 'partType':
          aValue = pcdbRefData.partTypes?.find(pt => pt.PartTerminologyID === a.partType)?.PartTerminologyName || a.partType || '';
          bValue = pcdbRefData.partTypes?.find(pt => pt.PartTerminologyID === b.partType)?.PartTerminologyName || b.partType || '';
          break;
        case 'dateAdded':
          aValue = new Date(a.id).getTime();
          bValue = new Date(b.id).getTime();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, filters, sortConfig, allMakes, allModels, components, vehicleSystemsRefData, pcdbRefData, vehicleSystemsFilters]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredApplications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredApplications.length / itemsPerPage);

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  const clearAllFilters = () => {
    setFilters({
      year: '',
      make: '',
      model: '',
      submodel: '',
      driveType: '',
      partType: '',
      position: '',
      mfrLabel: '',
      liter: '',
      transmissionControl: '',
      frontSpring: '',
      rearSpring: '',
      steeringType: '',
      steeringSystem: '',
      wheelbaseInches: '',
      bedLengthInches: '',
      bodyType: '',
      numDoors: ''
    });
  };

  const getUniqueValues = (field: string) => {
    const values = new Set<string>();
    applications.forEach(app => {
      let value = '';
      switch (field) {
        case 'year':
          value = app.year?.toString() || '';
          break;
        case 'make':
          value = allMakes.find(m => m.MakeID === app.make)?.MakeName || app.make || '';
          break;
        case 'model':
          value = allModels.find(m => m.ModelID === app.model)?.ModelName || app.model || '';
          break;
        case 'submodel':
          value = components.subModels.find(sm => sm.SubModelID === app.submodel)?.displayName || app.submodel || '';
          break;
        case 'driveType':
          value = vehicleSystemsRefData.driveTypes?.find(dt => dt.DriveTypeID === (app.driveType || vehicleSystemsFilters.driveType))?.DriveTypeName || app.driveType || vehicleSystemsFilters.driveType || '';
          break;
        case 'partType':
          value = pcdbRefData.partTypes?.find(pt => pt.PartTerminologyID === app.partType)?.PartTerminologyName || app.partType || '';
          break;
        case 'position':
          value = pcdbRefData.positions?.find(pos => pos.PositionID === app.position)?.Position || app.position || '';
          break;
        default:
          value = app[field] || '';
      }
      if (value) values.add(value);
    });
    return Array.from(values).sort().map(value => ({ value, label: value }));
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
        <p>No applications added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-medium text-sm">Filters</h5>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {activeFilterCount} active
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border rounded hover:bg-white"
              disabled={activeFilterCount === 0}
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <SearchableSelect
            options={getUniqueValues('year').slice(0, 20)}
            value={filters.year}
            onChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
            placeholder="Filter Year"
          />
          <SearchableSelect
            options={getUniqueValues('make')}
            value={filters.make}
            onChange={(value) => setFilters(prev => ({ ...prev, make: value }))}
            placeholder="Filter Make"
          />
          <SearchableSelect
            options={getUniqueValues('model')}
            value={filters.model}
            onChange={(value) => setFilters(prev => ({ ...prev, model: value }))}
            placeholder="Filter Model"
          />
          <SearchableSelect
            options={getUniqueValues('submodel')}
            value={filters.submodel}
            onChange={(value) => setFilters(prev => ({ ...prev, submodel: value }))}
            placeholder="Filter Submodel"
          />
          <SearchableSelect
            options={getUniqueValues('driveType')}
            value={filters.driveType}
            onChange={(value) => setFilters(prev => ({ ...prev, driveType: value }))}
            placeholder="Filter Drive Type"
          />
          <SearchableSelect
            options={getUniqueValues('partType')}
            value={filters.partType}
            onChange={(value) => setFilters(prev => ({ ...prev, partType: value }))}
            placeholder="Filter Part Type"
          />
          <SearchableSelect
            options={getUniqueValues('position')}
            value={filters.position}
            onChange={(value) => setFilters(prev => ({ ...prev, position: value }))}
            placeholder="Filter Position"
          />
          <SearchableSelect
            options={getUniqueValues('mfrLabel')}
            value={filters.mfrLabel}
            onChange={(value) => setFilters(prev => ({ ...prev, mfrLabel: value }))}
            placeholder="Filter Mfr Label"
          />
          
          {showConditionalColumns && applications.some(app => app.liter || engineFilters.liter) && (
            <SearchableSelect
              options={getUniqueValues('liter')}
              value={filters.liter}
              onChange={(value) => setFilters(prev => ({ ...prev, liter: value }))}
              placeholder="Filter Liter"
            />
          )}
          {showConditionalColumns && applications.some(app => app.transmissionControl || transmissionFilters.control) && (
            <SearchableSelect
              options={getUniqueValues('transmissionControl')}
              value={filters.transmissionControl}
              onChange={(value) => setFilters(prev => ({ ...prev, transmissionControl: value }))}
              placeholder="Filter Trans Control"
            />
          )}
          {showConditionalColumns && applications.some(app => app.frontSpring || vehicleSystemsFilters.frontSpring) && (
            <SearchableSelect
              options={getUniqueValues('frontSpring')}
              value={filters.frontSpring}
              onChange={(value) => setFilters(prev => ({ ...prev, frontSpring: value }))}
              placeholder="Filter Front Spring"
            />
          )}
          {showConditionalColumns && applications.some(app => app.rearSpring || vehicleSystemsFilters.rearSpring) && (
            <SearchableSelect
              options={getUniqueValues('rearSpring')}
              value={filters.rearSpring}
              onChange={(value) => setFilters(prev => ({ ...prev, rearSpring: value }))}
              placeholder="Filter Rear Spring"
            />
          )}
        </div>
      </div>
      
      {/* Sort and Pagination Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sortConfig.field}
              onChange={(e) => setSortConfig(prev => ({ ...prev, field: e.target.value }))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="year">Year</option>
              <option value="make">Make</option>
              <option value="model">Model</option>
              <option value="partType">Part Type</option>
              <option value="dateAdded">Date Added</option>
            </select>
            <button
              onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
              className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
            >
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedAndFilteredApplications.length)} of {sortedAndFilteredApplications.length} applications
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3 border-b font-medium">Year</th>
            <th className="text-left p-3 border-b font-medium">Make</th>
            <th className="text-left p-3 border-b font-medium">Model</th>
            <th className="text-left p-3 border-b font-medium">Submodel</th>
            <th className="text-left p-3 border-b font-medium">Drive Type</th>
            <th className="text-left p-3 border-b font-medium">Part Type Name</th>
            <th className="text-left p-3 border-b font-medium">Position</th>
            <th className="text-left p-3 border-b font-medium">Mfr Label</th>
            <th className="text-left p-3 border-b font-medium">Notes</th>
            
            {showConditionalColumns && applications.some(app => app.liter || engineFilters.liter) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Liter</th>
            )}
            {showConditionalColumns && applications.some(app => app.transmissionControl || transmissionFilters.control) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Transmission Control</th>
            )}
            {showConditionalColumns && applications.some(app => app.frontSpring || vehicleSystemsFilters.frontSpring) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Front Spring</th>
            )}
            {showConditionalColumns && applications.some(app => app.rearSpring || vehicleSystemsFilters.rearSpring) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Rear Spring</th>
            )}
            {showConditionalColumns && applications.some(app => app.steeringType || vehicleSystemsFilters.steeringType) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Steering Type</th>
            )}
            {showConditionalColumns && applications.some(app => app.steeringSystem || vehicleSystemsFilters.steeringSystem) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Steering System</th>
            )}
            {showConditionalColumns && applications.some(app => app.wheelbaseInches || physicalSpecsFilters.wheelbaseInches) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Wheel Base (Inches)</th>
            )}
            {showConditionalColumns && applications.some(app => app.bedLengthInches || physicalSpecsFilters.bedLengthInches) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Bed Length (Inches)</th>
            )}
            {showConditionalColumns && applications.some(app => app.bodyType || physicalSpecsFilters.bodyType) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Body Type</th>
            )}
            {showConditionalColumns && applications.some(app => app.numDoors || physicalSpecsFilters.numDoors) && (
              <th className="text-left p-3 border-b font-medium text-blue-600">Num Doors</th>
            )}
            {showConditionalColumns && applications.some(app => app.qualifiers && app.qualifiers.length > 0) && (
              <th className="text-left p-3 border-b font-medium text-purple-600">Qualifiers</th>
            )}
            
            <th className="text-left p-3 border-b font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedApplications.map((app: any) => {
            const yearName = app.year;
            const makeName = allMakes.find(m => m.MakeID === app.make)?.MakeName || app.make;
            const modelName = allModels.find(m => m.ModelID === app.model)?.ModelName || app.model;
            const submodelName = components.subModels.find(sm => sm.SubModelID === app.submodel)?.displayName || app.submodel || '-';
            const driveTypeName = vehicleSystemsRefData.driveTypes?.find(dt => dt.DriveTypeID === (app.driveType || vehicleSystemsFilters.driveType))?.DriveTypeName || app.driveType || vehicleSystemsFilters.driveType || '-';
            const partTypeName = pcdbRefData.partTypes?.find(pt => pt.PartTerminologyID === app.partType)?.PartTerminologyName || app.partType || '-';
            const positionName = pcdbRefData.positions?.find(pos => pos.PositionID === app.position)?.Position || app.position || '-';
            
            const literValue = app.liter || engineFilters.liter || '-';
            const transmissionControlName = transmissionRefData.controlTypes?.find(ct => ct.TransmissionControlTypeID === (app.transmissionControl || transmissionFilters.control))?.TransmissionControlTypeName || app.transmissionControl || transmissionFilters.control || '-';
            const frontSpringName = vehicleSystemsRefData.frontSpringTypes?.find(fs => fs.SpringTypeID === (app.frontSpring || vehicleSystemsFilters.frontSpring))?.SpringTypeName || app.frontSpring || vehicleSystemsFilters.frontSpring || '-';
            const rearSpringName = vehicleSystemsRefData.rearSpringTypes?.find(rs => rs.SpringTypeID === (app.rearSpring || vehicleSystemsFilters.rearSpring))?.SpringTypeName || app.rearSpring || vehicleSystemsFilters.rearSpring || '-';
            const steeringTypeName = vehicleSystemsRefData.steeringTypes?.find(st => st.SteeringTypeID === (app.steeringType || vehicleSystemsFilters.steeringType))?.SteeringTypeName || app.steeringType || vehicleSystemsFilters.steeringType || '-';
            const steeringSystemName = vehicleSystemsRefData.steeringSystems?.find(ss => ss.SteeringSystemID === (app.steeringSystem || vehicleSystemsFilters.steeringSystem))?.SteeringSystemName || app.steeringSystem || vehicleSystemsFilters.steeringSystem || '-';
            const wheelbaseValue = app.wheelbaseInches || physicalSpecsFilters.wheelbaseInches || '-';
            const bedLengthValue = app.bedLengthInches || physicalSpecsFilters.bedLengthInches || '-';
            const bodyTypeName = physicalSpecsRefData.bodyTypes?.find(bt => bt.BodyTypeID === (app.bodyType || physicalSpecsFilters.bodyType))?.BodyTypeName || app.bodyType || physicalSpecsFilters.bodyType || '-';
            const numDoorsValue = physicalSpecsRefData.bodyNumDoors?.find(bnd => bnd.BodyNumDoorsID === (app.numDoors || physicalSpecsFilters.numDoors))?.BodyNumDoors || app.numDoors || physicalSpecsFilters.numDoors || '-';
            
            return (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{yearName}</td>
                <td className="p-3">{makeName}</td>
                <td className="p-3">{modelName}</td>
                <td className="p-3">{submodelName}</td>
                <td className="p-3">{driveTypeName}</td>
                <td className="p-3">{partTypeName}</td>
                <td className="p-3">{positionName}</td>
                <td className="p-3">{app.mfrLabel || '-'}</td>
                <td className="p-3">{app.notes || '-'}</td>
                
                {showConditionalColumns && applications.some(app => app.liter || engineFilters.liter) && (
                  <td className="p-3 text-blue-600">{literValue}</td>
                )}
                {showConditionalColumns && applications.some(app => app.transmissionControl || transmissionFilters.control) && (
                  <td className="p-3 text-blue-600">{transmissionControlName}</td>
                )}
                {showConditionalColumns && applications.some(app => app.frontSpring || vehicleSystemsFilters.frontSpring) && (
                  <td className="p-3 text-blue-600">{frontSpringName}</td>
                )}
                {showConditionalColumns && applications.some(app => app.rearSpring || vehicleSystemsFilters.rearSpring) && (
                  <td className="p-3 text-blue-600">{rearSpringName}</td>
                )}
                {showConditionalColumns && applications.some(app => app.steeringType || vehicleSystemsFilters.steeringType) && (
                  <td className="p-3 text-blue-600">{steeringTypeName}</td>
                )}
                {showConditionalColumns && applications.some(app => app.steeringSystem || vehicleSystemsFilters.steeringSystem) && (
                  <td className="p-3 text-blue-600">{steeringSystemName}</td>
                )}
                {showConditionalColumns && applications.some(app => app.wheelbaseInches || physicalSpecsFilters.wheelbaseInches) && (
                  <td className="p-3 text-blue-600">{wheelbaseValue}</td>
                )}
                {showConditionalColumns && applications.some(app => app.bedLengthInches || physicalSpecsFilters.bedLengthInches) && (
                  <td className="p-3 text-blue-600">{bedLengthValue}</td>
                )}
                {showConditionalColumns && applications.some(app => app.bodyType || physicalSpecsFilters.bodyType) && (
                  <td className="p-3 text-blue-600">{bodyTypeName}</td>
                )}
                {showConditionalColumns && applications.some(app => app.numDoors || physicalSpecsFilters.numDoors) && (
                  <td className="p-3 text-blue-600">{numDoorsValue}</td>
                )}
                {showConditionalColumns && applications.some(app => app.qualifiers && app.qualifiers.length > 0) && (
                  <td className="p-3 text-purple-600">
                    {app.qualifiers && app.qualifiers.length > 0 ? (
                      <div className="text-xs">
                        {app.qualifiers.map((q: any, i: number) => (
                          <div key={i} className="mb-1">
                            <span className="font-medium">{q.qualifierId}</span>: {q.qualifierValue}
                          </div>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                )}
                
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEdit(app.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-300 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onRemove(app.id)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded border border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2 py-1 border rounded text-sm ${
                      currentPage === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Go to page:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="w-16 px-2 py-1 border rounded text-sm text-center"
            />
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
};