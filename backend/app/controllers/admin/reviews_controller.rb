class Admin::ReviewsController < Admin::ApplicationController
  before_action :set_review, only: [:show, :destroy]

  def index
    @reviews = Review.includes(:user, :campaign).recent.page(params[:page]).per(20)
    @reviews = @reviews.by_rating(params[:rating]) if params[:rating].present?
  end

  def show
  end

  def destroy
    @review.destroy
    redirect_to admin_reviews_path, notice: 'レビューが削除されました'
  end

  private

  def set_review
    @review = Review.find(params[:id])
  end
end