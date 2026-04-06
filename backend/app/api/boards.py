from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.board import Board, Post, Comment
from app.models.user import User
from app.schemas.board import (
    BoardResponse, PostCreate, PostResponse, PostListResponse,
    CommentCreate, CommentResponse,
)
from app.services.auth.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=list[BoardResponse])
async def list_boards(
    board_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Board)
    if board_type:
        query = query.where(Board.board_type == board_type)
    query = query.order_by(Board.name)

    result = await db.execute(query)
    boards = result.scalars().all()

    items = []
    for board in boards:
        count_result = await db.execute(
            select(func.count(Post.id)).where(Post.board_id == board.id)
        )
        resp = BoardResponse.model_validate(board)
        resp.post_count = count_result.scalar_one()
        items.append(resp)
    return items


@router.get("/{board_slug}/posts", response_model=PostListResponse)
async def list_posts(
    board_slug: str,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    board_result = await db.execute(select(Board).where(Board.slug == board_slug))
    board = board_result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    query = (
        select(Post, User.username, User.display_name)
        .join(User, Post.author_id == User.id)
        .where(Post.board_id == board.id)
        .order_by(Post.created_at.desc())
        .offset((page - 1) * size).limit(size)
    )
    count_query = select(func.count(Post.id)).where(Post.board_id == board.id)

    result = await db.execute(query)
    total_result = await db.execute(count_query)

    items = []
    for post, username, display_name in result.all():
        comment_count_result = await db.execute(
            select(func.count(Comment.id)).where(Comment.post_id == post.id)
        )
        resp = PostResponse(
            id=post.id,
            board_id=post.board_id,
            title=post.title,
            content=post.content,
            view_count=post.view_count,
            like_count=post.like_count,
            author_username=username,
            author_display_name=display_name,
            comment_count=comment_count_result.scalar_one(),
            created_at=post.created_at,
            updated_at=post.updated_at,
        )
        items.append(resp)

    return PostListResponse(
        items=items,
        total=total_result.scalar_one(),
        page=page,
        size=size,
    )


@router.post("/{board_slug}/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    board_slug: str,
    body: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    board_result = await db.execute(select(Board).where(Board.slug == board_slug))
    board = board_result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    post = Post(
        board_id=board.id,
        author_id=current_user.id,
        title=body.title,
        content=body.content,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return PostResponse(
        id=post.id,
        board_id=post.board_id,
        title=post.title,
        content=post.content,
        view_count=0,
        like_count=0,
        author_username=current_user.username,
        author_display_name=current_user.display_name,
        comment_count=0,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.get("/{board_slug}/posts/{post_id}", response_model=PostResponse)
async def get_post(
    board_slug: str,
    post_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post, User.username, User.display_name)
        .join(User, Post.author_id == User.id)
        .join(Board, Post.board_id == Board.id)
        .where(Board.slug == board_slug, Post.id == post_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")

    post, username, display_name = row

    # Increment view count
    post.view_count += 1
    await db.commit()

    comment_count_result = await db.execute(
        select(func.count(Comment.id)).where(Comment.post_id == post.id)
    )

    return PostResponse(
        id=post.id,
        board_id=post.board_id,
        title=post.title,
        content=post.content,
        view_count=post.view_count,
        like_count=post.like_count,
        author_username=username,
        author_display_name=display_name,
        comment_count=comment_count_result.scalar_one(),
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.post("/{board_slug}/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    board_slug: str,
    post_id: int,
    body: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify post exists in the board
    post_result = await db.execute(
        select(Post)
        .join(Board, Post.board_id == Board.id)
        .where(Board.slug == board_slug, Post.id == post_id)
    )
    if not post_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        content=body.content,
        parent_id=body.parent_id,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        content=comment.content,
        like_count=0,
        author_username=current_user.username,
        author_display_name=current_user.display_name,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
    )


@router.get("/{board_slug}/posts/{post_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    board_slug: str,
    post_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Comment, User.username, User.display_name)
        .join(User, Comment.author_id == User.id)
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at)
    )

    return [
        CommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            content=comment.content,
            like_count=comment.like_count,
            author_username=username,
            author_display_name=display_name,
            parent_id=comment.parent_id,
            created_at=comment.created_at,
        )
        for comment, username, display_name in result.all()
    ]
