"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class PostCategoriesQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone();
    }
    New() {
        return new PostCategoriesQ(this.builder.clone());
    }
    insert(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                post_id: params.post_id,
                category_id: params.category_id,
            };
            yield this.builder.clone().insert(data);
            return data;
        });
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.builder.clone().first();
            return row !== null && row !== void 0 ? row : null;
        });
    }
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.builder.clone();
            return rows !== null && rows !== void 0 ? rows : [];
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.builder.clone().del();
        });
    }
    filterPostID(postId) {
        this.builder = this.builder.where('post_id', postId);
        this.counter = this.counter.where('post_id', postId);
        return this;
    }
    filterCategoryID(categoryId) {
        this.builder = this.builder.where('category_id', categoryId);
        this.counter = this.counter.where('category_id', categoryId);
        return this;
    }
    filterCategoryIDs(categoryIds) {
        this.builder = this.builder.whereIn('category_id', categoryIds);
        this.counter = this.counter.whereIn('category_id', categoryIds);
        return this;
    }
    page(limit, offset = 0) {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const row = yield ((_b = (_a = this.counter.clone()).clearOrder) === null || _b === void 0 ? void 0 : _b.call(_a).count({ cnt: '*' }).first());
            const val = (_e = (_d = (_c = row === null || row === void 0 ? void 0 : row.cnt) !== null && _c !== void 0 ? _c : row === null || row === void 0 ? void 0 : row['count(*)']) !== null && _d !== void 0 ? _d : Object.values(row !== null && row !== void 0 ? row : { 0: 0 })[0]) !== null && _e !== void 0 ? _e : 0;
            return Number(val);
        });
    }
}
exports.default = PostCategoriesQ;
