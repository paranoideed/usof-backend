import {Database} from "../../../database/database.js";
import { v4 as uuid } from 'uuid';

export default class CommentDomain {
    constructor(config) {
        this.db = new Database(config);
    }

    async createComment(content, userId, postId, parentId = null) {
        content = String(content).trim();

        const commID = uuid();
        const newComment = {
            id:         commID,
            post_id:    postId,
            user_id:    userId,
            parent_id:  parentId,
            content:    content,
            created_at: new Date(),
        };

        await this.db.comments().insert(newComment);

        return newComment;
    }

    async getCommentById(commentId) {
        return this.db.comments().filterID(commentId).get();
    }

    async updateComment(commentId, newContent) {
        newContent = String(newContent).trim();
        await this.db.comments().filterID(commentId).update({
            content:   newContent,
            updatedAt: new Date(),
        });
    }

    async deleteComment(commentId) {
        await this.db.comments().filterID(commentId).delete();
    }

    async listCommentsByPost(postId, limit = 10, offset = 0) {
        return this.db.comments()
            .filterPostID(postId)
            .filterParentID(null)
            .page(limit, offset)
            .select();
    }

    async countCommentsByPost(parentId, limit = 10, offset = 0) {
        return this.db.comments()
            .filterParentID(parentId)
            .page(limit, offset)
            .count();
    }


}