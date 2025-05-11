from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_raw_text_column'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('transactions', sa.Column('raw_text', sa.String(), nullable=True))

def downgrade():
    op.drop_column('transactions', 'raw_text')
