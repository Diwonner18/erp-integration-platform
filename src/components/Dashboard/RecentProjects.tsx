
import React from 'react';
import { Calendar, MapPin, User } from 'lucide-react';

const RecentProjects = () => {
  const recentProjects = [
    {
      id: 1,
      title: 'Reforma Residencial - Casa Silva',
      client: 'João Silva',
      location: 'Bairro Centro, São Paulo',
      status: 'Em Andamento',
      date: '2024-01-15',
      progress: 75
    },
    {
      id: 2,
      title: 'Construção Comercial - Loja ABC',
      client: 'Empresa ABC Ltda',
      location: 'Vila Madalena, São Paulo',
      status: 'Aguardando Aprovação',
      date: '2024-01-20',
      progress: 25
    },
    {
      id: 3,
      title: 'Ampliação Residencial - Casa Santos',
      client: 'Maria Santos',
      location: 'Jardim Paulista, São Paulo',
      status: 'Planejamento',
      date: '2024-01-25',
      progress: 10
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento':
        return 'bg-green-100 text-green-800';
      case 'Aguardando Aprovação':
        return 'bg-yellow-100 text-yellow-800';
      case 'Planejamento':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Projetos Recentes</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {recentProjects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-2">{project.title}</h4>
                
                <div className="flex items-center text-sm text-slate-600 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  {project.client}
                </div>
                
                <div className="flex items-center text-sm text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {project.location}
                </div>
                
                <div className="flex items-center text-sm text-slate-600 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(project.date).toLocaleDateString('pt-BR')}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="mr-2">Progresso:</span>
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
