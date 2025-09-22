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
class CategoriesQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone();
    }
    New() {
        return new CategoriesQ(this.builder.clone());
    }
    insert(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = {
                id: params.id,
                title: params.title,
                created_at: (_a = params.created_at) !== null && _a !== void 0 ? _a : new Date(),
                updated_at: null,
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
    update(set) {
        return __awaiter(this, void 0, void 0, function* () {
            const setMap = {};
            if (Object.prototype.hasOwnProperty.call(set, 'title')) {
                setMap.title = set.title;
            }
            if (Object.prototype.hasOwnProperty.call(set, 'updated_at')) {
                setMap.updated_at = set.updated_at;
            }
            else {
                setMap.updated_at = new Date();
            }
            yield this.builder.clone().update(setMap);
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.builder.clone().del();
        });
    }
    filterID(id) {
        this.builder = this.builder.where('id', id);
        this.counter = this.counter.where('id', id);
        return this;
    }
    filterTitle(title) {
        this.builder = this.builder.where('title', title);
        this.counter = this.counter.where('title', title);
        return this;
    }
    filterTitleLike(substr) {
        const v = `%${substr}%`;
        this.builder = this.builder.where('title', 'like', v);
        this.counter = this.counter.where('title', 'like', v);
        return this;
    }
    filterCreatedFrom(ts) {
        this.builder = this.builder.where('created_at', '>=', ts);
        this.counter = this.counter.where('created_at', '>=', ts);
        return this;
    }
    orderByCreatedAt(asc = true) {
        this.builder = this.builder.orderBy('created_at', asc ? 'asc' : 'desc');
        return this;
    }
    orderByTitle(asc = true) {
        this.builder = this.builder.orderBy('title', asc ? 'asc' : 'desc');
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
exports.default = CategoriesQ;
