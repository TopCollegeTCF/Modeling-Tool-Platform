import { Project } from '../models/Project.js';

export class ProjectService {
    constructor(pool) {
        this.projectModel = new Project(pool);
    }

    async createProject(userId, name, description) {
        return this.projectModel.create(userId, name, description);
    }

    async getProjects(userId) {
        return this.projectModel.findByUserId(userId);
    }

    async getProject(userId, projectId) {
        return this.projectModel.findById(projectId, userId);
    }

    async updateProject(userId, projectId, data) {
        return this.projectModel.update(projectId, userId, data);
    }

    async deleteProject(userId, projectId) {
        return this.projectModel.delete(projectId, userId);
    }

    async saveSceneData(userId, projectId, sceneData) {
        return this.projectModel.update(projectId, userId, { scene_data: sceneData });
    }
}