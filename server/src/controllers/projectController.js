import { ProjectService } from '../services/projectService.js';

export class ProjectController {
    constructor(pool) {
        this.projectService = new ProjectService(pool);
    }

    getProjects = async (request, reply) => {
        try {
            const userId = request.user.id;
            const projects = await this.projectService.getProjects(userId);
            return reply.code(200).send(projects);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    };

    createProject = async (request, reply) => {
        try {
            const userId = request.user.id;
            const { name, description } = request.body;
            
            if (!name) {
                return reply.code(400).send({ error: 'Project name is required' });
            }

            const project = await this.projectService.createProject(userId, name, description);
            return reply.code(201).send(project);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    };

    getProject = async (request, reply) => {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            
            const project = await this.projectService.getProject(userId, id);
            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }
            
            return reply.code(200).send(project);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    };

    updateProject = async (request, reply) => {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            const data = request.body;
            
            const project = await this.projectService.updateProject(userId, id, data);
            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }
            
            return reply.code(200).send(project);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    };

    deleteProject = async (request, reply) => {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            
            const project = await this.projectService.deleteProject(userId, id);
            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }
            
            return reply.code(204).send();
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    };

    exportProject = async (request, reply) => {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            const { format } = request.query;
            
            const project = await this.projectService.getProject(userId, id);
            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }

            // Здесь будет логика экспорта в STL или GLTF
            // Это возвращает данные, которые клиент будет обрабатывать
            
            return reply.code(200).send({
                projectId: project.id,
                name: project.name,
                format: format || 'gltf',
                sceneData: project.scene_data
            });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    };
}