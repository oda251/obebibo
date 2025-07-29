class Api::Users::UsersController < Api::ApplicationController
  before_action :authenticate_user!

  def show
    render json: {
      user: {
        id: current_user.id,
        email: current_user.email,
        created_at: current_user.created_at
      }
    }
  end

  def entries
    @entries = current_user.entries.includes(:campaign).recent.page(params[:page]).per(params[:per_page] || 10)
    
    render json: {
      entries: @entries.map { |e| entry_json(e) },
      total: @entries.total_count,
      page: @entries.current_page,
      per_page: @entries.limit_value
    }
  end

  def reviews
    @reviews = current_user.reviews.includes(:campaign).recent.page(params[:page]).per(params[:per_page] || 10)
    
    render json: {
      reviews: @reviews.map { |r| review_json(r) },
      total: @reviews.total_count,
      page: @reviews.current_page,
      per_page: @reviews.limit_value
    }
  end

  private

  def entry_json(entry)
    {
      id: entry.id,
      status: entry.status,
      created_at: entry.created_at,
      campaign: {
        id: entry.campaign.id,
        title: entry.campaign.title,
        image_url: entry.campaign.image_url
      }
    }
  end

  def review_json(review)
    {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      campaign: {
        id: review.campaign.id,
        title: review.campaign.title,
        image_url: review.campaign.image_url
      }
    }
  end
end