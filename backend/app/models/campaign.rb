class Campaign < ApplicationRecord
  belongs_to :company
  has_many :entries, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :users, through: :entries

  validates :title, presence: true
  validates :description, presence: true
  validates :start_at, presence: true
  validates :end_at, presence: true
  validates :status, presence: true

  enum status: {
    draft: 'draft',
    active: 'active',
    closed: 'closed',
    completed: 'completed'
  }

  scope :active_campaigns, -> { where(status: 'active') }
  scope :current, -> { where('start_at <= ? AND end_at >= ?', Time.current, Time.current) }
  scope :recent, -> { order(created_at: :desc) }

  def active?
    status == 'active' && start_at <= Time.current && end_at >= Time.current
  end

  def application_period?
    active? && Time.current.between?(start_at, end_at)
  end

  def entry_count
    entries.count
  end

  def winner_count
    entries.where(status: 'winner').count
  end

  def average_rating
    return 0 if reviews.empty?
    reviews.average(:rating).to_f.round(1)
  end
end