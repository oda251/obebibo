class Api::Admin::ReviewsController < Api::ApplicationController
  before_action :authenticate_admin!

  def index
    @reviews = Review.includes(:user, :campaign).recent.page(params[:page]).per(params[:per_page] || 20)
    
    render json: {
      reviews: @reviews.map { |r| review_json(r) },
      total: @reviews.total_count,
      page: @reviews.current_page,
      per_page: @reviews.limit_value
    }
  end

  private

  def review_json(review)
    {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      user: {
        id: review.user.id,
        email: review.user.email
      },
      campaign: {
        id: review.campaign.id,
        title: review.campaign.title,
        company: {
          name: review.campaign.company.name
        }
      }
    }
  end

  def authenticate_admin!
    render_error('管理者権限が必要です', :unauthorized) unless admin_signed_in?
  end
end