from datetime import datetime

from pydantic import BaseModel


class BoardResponse(BaseModel):
    id: int
    slug: str
    name: str
    board_type: str
    description: str | None
    post_count: int = 0

    model_config = {"from_attributes": True}


class PostCreate(BaseModel):
    title: str
    content: str


class PostResponse(BaseModel):
    id: int
    board_id: int
    title: str
    content: str
    view_count: int
    like_count: int
    author_username: str
    author_display_name: str | None
    comment_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PostListResponse(BaseModel):
    items: list[PostResponse]
    total: int
    page: int
    size: int


class CommentCreate(BaseModel):
    content: str
    parent_id: int | None = None


class CommentResponse(BaseModel):
    id: int
    post_id: int
    content: str
    like_count: int
    author_username: str
    author_display_name: str | None
    parent_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
