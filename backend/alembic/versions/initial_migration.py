"""initial migration

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2025-05-11 05:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create categories table
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('color', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=True)

    # Create transactions table
    op.create_table('transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('transaction_type', sa.String(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transactions_date'), 'transactions', ['date'], unique=False)
    op.create_index(op.f('ix_transactions_description'), 'transactions', ['description'], unique=False)
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_description'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_date'), table_name='transactions')
    op.drop_table('transactions')
    op.drop_index(op.f('ix_categories_name'), table_name='categories')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')
